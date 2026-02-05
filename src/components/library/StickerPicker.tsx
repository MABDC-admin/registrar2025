import { useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconSearch } from './IconSearch';
import { Smile, Search } from 'lucide-react';

export interface StickerData {
  type: 'emoji' | 'icon';
  value: string;
}

interface StickerPickerProps {
  onSelect: (sticker: StickerData) => void;
}

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [activeTab, setActiveTab] = useState('emoji');

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect({
      type: 'emoji',
      value: emojiData.emoji,
    });
  };

  const handleIconSelect = (iconUrl: string) => {
    onSelect({
      type: 'icon',
      value: iconUrl,
    });
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="emoji" className="flex items-center gap-1.5">
            <Smile className="h-4 w-4" />
            Emojis
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex items-center gap-1.5">
            <Search className="h-4 w-4" />
            Icons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emoji" className="mt-0">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width="100%"
            height={350}
            theme={Theme.AUTO}
            searchPlaceholder="Search emojis..."
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis
          />
        </TabsContent>

        <TabsContent value="icons" className="mt-0">
          <IconSearch onSelect={handleIconSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
