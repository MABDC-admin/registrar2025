/**
 * Database Query Helpers with School-Academic Year Segregation
 * 
 * This module provides helper functions that automatically apply
 * school_id and academic_year_id filters to all database queries,
 * ensuring complete data isolation between schools.
 */

import { supabase } from '@/lib/supabase';
import { useSchool } from '@/contexts/SchoolContext';

/**
 * Error thrown when school or academic year context is missing
 */
export class SchoolContextError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SchoolContextError';
    }
}

/**
 * Validates that school and academic year context is available
 */
export function validateSchoolContext(
    schoolId: string | null,
    academicYearId: string | null
): asserts schoolId is string, academicYearId is string {
    if (!schoolId) {
        throw new SchoolContextError('School context is required but not set');
    }
    if (!academicYearId) {
        throw new SchoolContextError('Academic year context is required but not set');
    }
}

/**
 * Base filter object for school-academic year segregation
 */
export interface SchoolYearFilter {
    school_id: string;
    academic_year_id: string;
}

/**
 * Creates a base filter object with school and academic year
 */
export function createSchoolYearFilter(
    schoolId: string,
    academicYearId: string
): SchoolYearFilter {
    validateSchoolContext(schoolId, academicYearId);
    return {
        school_id: schoolId,
        academic_year_id: academicYearId,
    };
}

/**
 * Query builder that automatically applies school-year filters
 */
export class SchoolYearQueryBuilder<T> {
    private tableName: string;
    private schoolId: string;
    private academicYearId: string;

    constructor(tableName: string, schoolId: string, academicYearId: string) {
        validateSchoolContext(schoolId, academicYearId);
        this.tableName = tableName;
        this.schoolId = schoolId;
        this.academicYearId = academicYearId;
    }

    /**
     * Select query with automatic school-year filtering
     */
    select(columns: string = '*') {
        return supabase
            .from(this.tableName)
            .select(columns)
            .eq('school_id', this.schoolId)
            .eq('academic_year_id', this.academicYearId);
    }

    /**
     * Insert with automatic school-year fields
     */
    insert(data: Partial<T> | Partial<T>[]) {
        const baseFilter = createSchoolYearFilter(this.schoolId, this.academicYearId);

        if (Array.isArray(data)) {
            const dataWithContext = data.map(item => ({
                ...baseFilter,
                ...item,
            }));
            return supabase.from(this.tableName).insert(dataWithContext);
        } else {
            const dataWithContext = {
                ...baseFilter,
                ...data,
            };
            return supabase.from(this.tableName).insert(dataWithContext);
        }
    }

    /**
     * Update with automatic school-year filtering
     */
    update(data: Partial<T>) {
        return supabase
            .from(this.tableName)
            .update(data)
            .eq('school_id', this.schoolId)
            .eq('academic_year_id', this.academicYearId);
    }

    /**
     * Delete with automatic school-year filtering
     */
    delete() {
        return supabase
            .from(this.tableName)
            .delete()
            .eq('school_id', this.schoolId)
            .eq('academic_year_id', this.academicYearId);
    }

    /**
     * Upsert with automatic school-year fields
     */
    upsert(data: Partial<T> | Partial<T>[]) {
        const baseFilter = createSchoolYearFilter(this.schoolId, this.academicYearId);

        if (Array.isArray(data)) {
            const dataWithContext = data.map(item => ({
                ...baseFilter,
                ...item,
            }));
            return supabase.from(this.tableName).upsert(dataWithContext);
        } else {
            const dataWithContext = {
                ...baseFilter,
                ...data,
            };
            return supabase.from(this.tableName).upsert(dataWithContext);
        }
    }
}

/**
 * Hook to get a query builder with current school context
 */
export function useSchoolYearQuery<T = any>(tableName: string) {
    const { selectedSchool, currentAcademicYear } = useSchool();

    if (!selectedSchool?.id || !currentAcademicYear?.id) {
        throw new SchoolContextError(
            'School and academic year must be selected to perform database operations'
        );
    }

    return new SchoolYearQueryBuilder<T>(
        tableName,
        selectedSchool.id,
        currentAcademicYear.id
    );
}

/**
 * Helper function to create a query builder without React hook
 * Use this in server-side code or when you have the IDs directly
 */
export function createSchoolYearQuery<T = any>(
    tableName: string,
    schoolId: string,
    academicYearId: string
) {
    return new SchoolYearQueryBuilder<T>(tableName, schoolId, academicYearId);
}

/**
 * Utility to verify a record belongs to the current school-year context
 */
export async function verifyRecordOwnership(
    tableName: string,
    recordId: string,
    schoolId: string,
    academicYearId: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', recordId)
        .eq('school_id', schoolId)
        .eq('academic_year_id', academicYearId)
        .single();

    return !error && data !== null;
}

/**
 * Type-safe filter builder
 */
export function buildSchoolYearFilters<T extends Record<string, any>>(
    schoolId: string,
    academicYearId: string,
    additionalFilters?: Partial<T>
): SchoolYearFilter & Partial<T> {
    const baseFilter = createSchoolYearFilter(schoolId, academicYearId);
    return {
        ...baseFilter,
        ...additionalFilters,
    };
}
