import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';

import useBudgetDetailActivityOverview from './useBudgetDetailActivityOverview';
import useBudgetId from './useBudgetId';
import useSubsidyAccessPolicy from './useSubsidyAccessPolicy';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';
import {
  mockAssignableSubsidyAccessPolicy,
  mockPerLearnerSpendLimitSubsidyAccessPolicy,
  mockEnterpriseOfferId,
  mockSubsidyAccessPolicyUUID,
} from '../tests/constants';

jest.mock('./useBudgetId');
jest.mock('./useSubsidyAccessPolicy');

const mockEnterpriseUUID = 'mock-enterprise-uuid';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useBudgetDetailActivityOverview', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('handles when budget is an enterprise offer id (not a subsidy access policy uuid)', async () => {
    useBudgetId.mockReturnValue({
      budgetId: mockEnterpriseOfferId,
      subsidyAccessPolicyId: undefined,
    });
    useSubsidyAccessPolicy.mockReturnValue({ data: undefined });
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    const mockFetchCourseEnrollments = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
    mockFetchCourseEnrollments.mockResolvedValue({
      data: {
        count: 1,
        results: [{ id: 'mock-course-enrollment-id' }],
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useBudgetDetailActivityOverview({
        enterpriseUUID: mockEnterpriseUUID,
        isTopDownAssignmentEnabled: true,
      }),
      { wrapper },
    );

    expect(useSubsidyAccessPolicy).toHaveBeenCalledWith(undefined);

    expect(mockListContentAssignments).not.toHaveBeenCalled();
    expect(mockFetchCourseEnrollments).toHaveBeenCalledTimes(1);

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: true,
        data: undefined,
      }),
    );

    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: {
          spentTransactions: {
            count: 1,
            results: [{ id: 'mock-course-enrollment-id' }],
          },
        },
      }),
    );
  });

  it.each([
    { hasAssignableBudget: false, isTopDownAssignmentEnabled: false },
    { hasAssignableBudget: true, isTopDownAssignmentEnabled: false },
    { hasAssignableBudget: false, isTopDownAssignmentEnabled: true },
    { hasAssignableBudget: true, isTopDownAssignmentEnabled: true },
  ])('handles when budget is a subsidy access policy uuid (not an enterprise offer id) (%s)', async ({ hasAssignableBudget, isTopDownAssignmentEnabled }) => {
    useBudgetId.mockReturnValue({
      budgetId: mockSubsidyAccessPolicyUUID,
      subsidyAccessPolicyId: mockSubsidyAccessPolicyUUID,
    });
    useSubsidyAccessPolicy.mockReturnValue({
      data: hasAssignableBudget ? mockAssignableSubsidyAccessPolicy : mockPerLearnerSpendLimitSubsidyAccessPolicy,
    });
    const mockListContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'listContentAssignments');
    if (hasAssignableBudget && isTopDownAssignmentEnabled) {
      mockListContentAssignments.mockResolvedValue({
        data: {
          count: 1,
          results: [{ id: 'mock-content-assignment-id' }],
        },
      });
    }
    const mockFetchCourseEnrollments = jest.spyOn(EnterpriseDataApiService, 'fetchCourseEnrollments');
    mockFetchCourseEnrollments.mockResolvedValue({
      data: {
        count: 1,
        results: [{ id: 'mock-course-enrollment-id' }],
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useBudgetDetailActivityOverview({
        enterpriseUUID: mockEnterpriseUUID,
        isTopDownAssignmentEnabled: true,
      }),
      { wrapper },
    );

    expect(useSubsidyAccessPolicy).toHaveBeenCalledWith(mockSubsidyAccessPolicyUUID);

    expect(mockFetchCourseEnrollments).toHaveBeenCalledTimes(1);
    if (hasAssignableBudget) {
      expect(mockListContentAssignments).toHaveBeenCalledTimes(1);
    } else {
      expect(mockListContentAssignments).not.toHaveBeenCalled();
    }

    await waitForNextUpdate();

    const expectedData = {
      spentTransactions: {
        count: 1,
        results: [{ id: 'mock-course-enrollment-id' }],
      },
    };

    if (hasAssignableBudget && isTopDownAssignmentEnabled) {
      expectedData.contentAssignments = {
        count: 1,
        results: [{ id: 'mock-content-assignment-id' }],
      };
    }

    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: false,
        data: expectedData,
      }),
    );
  });
});