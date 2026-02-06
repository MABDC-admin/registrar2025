import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PageDetectionResult {
  pageIndex: number;
  detectedPageNumber: string | null;
  pageType: 'numbered' | 'cover' | 'blank' | 'unknown';
  confidence: number;
}

interface UsePageDetectionOptions {
  bookId: string;
  autoDetect?: boolean;
}

export function usePageDetection({ bookId, autoDetect = true }: UsePageDetectionOptions) {
  const [detectedPages, setDetectedPages] = useState<Map<number, PageDetectionResult>>(new Map());
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const detectionCache = useRef<Map<string, PageDetectionResult>>(new Map());
  const abortController = useRef<AbortController | null>(null);

  // Detect page number for a single page
  const detectPageNumber = useCallback(async (
    imageUrl: string,
    pageIndex: number
  ): Promise<PageDetectionResult | null> => {
    // Check cache first
    const cacheKey = `${bookId}-${pageIndex}`;
    if (detectionCache.current.has(cacheKey)) {
      return detectionCache.current.get(cacheKey)!;
    }

    try {
      const { data, error } = await supabase.functions.invoke('detect-page-number', {
        body: { imageUrl, pageIndex }
      });

      if (error) {
        console.error('Page detection error:', error);
        return null;
      }

      const result = data as PageDetectionResult;
      detectionCache.current.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error('Failed to detect page number:', err);
      return null;
    }
  }, [bookId]);

  // Detect page numbers for multiple pages
  const detectPagesSequentially = useCallback(async (
    pages: { pageIndex: number; imageUrl: string }[]
  ) => {
    if (pages.length === 0) return;

    setIsDetecting(true);
    setDetectionProgress(0);
    abortController.current = new AbortController();

    const results = new Map<number, PageDetectionResult>();
    let completed = 0;

    // Process pages sequentially with small delay to avoid rate limits
    for (const page of pages) {
      if (abortController.current?.signal.aborted) break;

      const result = await detectPageNumber(page.imageUrl, page.pageIndex);
      if (result) {
        results.set(page.pageIndex, result);
        setDetectedPages(prev => new Map(prev).set(page.pageIndex, result));
      }

      completed++;
      setDetectionProgress(Math.round((completed / pages.length) * 100));

      // Small delay between requests to avoid rate limiting
      if (completed < pages.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsDetecting(false);
    
    // Show summary toast
    const numberedPages = Array.from(results.values()).filter(r => r.pageType === 'numbered');
    const coverPages = Array.from(results.values()).filter(r => r.pageType === 'cover');
    const blankPages = Array.from(results.values()).filter(r => r.pageType === 'blank');
    
    if (numberedPages.length > 0) {
      toast.success(`Detected ${numberedPages.length} numbered pages`, {
        description: `${coverPages.length} cover, ${blankPages.length} blank pages identified`
      });
    }

    return results;
  }, [detectPageNumber]);

  // Cancel ongoing detection
  const cancelDetection = useCallback(() => {
    abortController.current?.abort();
    setIsDetecting(false);
  }, []);

  // Get display info for a page
  const getPageDisplayInfo = useCallback((pageIndex: number): {
    displayNumber: string;
    shouldHide: boolean;
    isDetected: boolean;
    pageType: string;
  } => {
    const detection = detectedPages.get(pageIndex);
    
    if (!detection) {
      return {
        displayNumber: String(pageIndex + 1),
        shouldHide: false,
        isDetected: false,
        pageType: 'unknown'
      };
    }

    // Hide cover and blank pages from main view
    const shouldHide = detection.pageType === 'cover' || detection.pageType === 'blank';
    
    // Use detected page number if available, otherwise use index
    const displayNumber = detection.detectedPageNumber || String(pageIndex + 1);

    return {
      displayNumber,
      shouldHide,
      isDetected: true,
      pageType: detection.pageType
    };
  }, [detectedPages]);

  // Clear cache on unmount
  useEffect(() => {
    return () => {
      cancelDetection();
    };
  }, [cancelDetection]);

  return {
    detectedPages,
    isDetecting,
    detectionProgress,
    detectPageNumber,
    detectPagesSequentially,
    cancelDetection,
    getPageDisplayInfo,
  };
}
