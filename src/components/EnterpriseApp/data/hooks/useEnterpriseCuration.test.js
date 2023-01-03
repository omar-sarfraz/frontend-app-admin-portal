import { renderHook } from '@testing-library/react-hooks/dom';

import { mergeConfig } from '@edx/frontend-platform/config';
import useEnterpriseCuration from './useEnterpriseCuration';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';

jest.mock('../../../../data/services/EnterpriseCatalogApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_NAME = 'Test Enterprise';

const mockEnterpriseCurationConfig = {
  uuid: 'fake-uuid',
  title: TEST_ENTERPRISE_NAME,
  isHighlightFeatureActive: true,
  highlightSets: [],
  created: '2022-10-31',
  modified: '2022-10-31',
};

const mockEnterpriseCurationConfigResponse = {
  count: 1,
  current_page: 1,
  num_pages: 1,
  results: [mockEnterpriseCurationConfig],
};

describe('useEnterpriseCuration', () => {
  describe('without feature flag', () => {
    beforeEach(() => {
      mergeConfig({ FEATURE_CONTENT_HIGHLIGHTS: false });
      jest.resetAllMocks();
    });

    it('should do nothing', () => {
      EnterpriseCatalogApiService.getEnterpriseCurationConfig.mockResolvedValueOnce({ data: {} });
      const args = {};
      const { result } = renderHook(() => useEnterpriseCuration(args));
      expect(result.current).toEqual({
        isLoading: false,
        fetchError: null,
        enterpriseCuration: null,
      });
      expect(EnterpriseCatalogApiService.getEnterpriseCurationConfig).not.toHaveBeenCalled();
    });
  });

  describe('with feature flag', () => {
    beforeEach(() => {
      mergeConfig({ FEATURE_CONTENT_HIGHLIGHTS: true });
      jest.resetAllMocks();
    });

    it('should do nothing without an enterprise id', async () => {
      EnterpriseCatalogApiService.getEnterpriseCurationConfig.mockResolvedValueOnce({ data: {} });
      const args = {};
      const { result } = renderHook(() => useEnterpriseCuration(args));
      expect(result.current).toEqual({
        isLoading: false,
        fetchError: null,
        enterpriseCuration: null,
      });
      expect(EnterpriseCatalogApiService.getEnterpriseCurationConfig).not.toHaveBeenCalled();
    });

    it('should retrieve existing enterprise curation config', async () => {
      EnterpriseCatalogApiService.getEnterpriseCurationConfig.mockResolvedValueOnce({
        data: mockEnterpriseCurationConfigResponse,
      });

      const args = {
        enterpriseId: TEST_ENTERPRISE_UUID,
        curationTitleForCreation: TEST_ENTERPRISE_NAME,
      };
      const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCuration(args));

      expect(result.current).toEqual({
        isLoading: true,
        fetchError: null,
        enterpriseCuration: null,
      });

      await waitForNextUpdate();

      expect(
        EnterpriseCatalogApiService.getEnterpriseCurationConfig,
      ).toHaveBeenCalled();
      expect(
        EnterpriseCatalogApiService.createEnterpriseCurationConfig,
      ).not.toHaveBeenCalled();

      expect(result.current).toEqual({
        isLoading: false,
        fetchError: null,
        enterpriseCuration: expect.objectContaining(mockEnterpriseCurationConfig),
      });
    });

    it('should create enterprise curation config if one does not exist', async () => {
      EnterpriseCatalogApiService.getEnterpriseCurationConfig.mockResolvedValueOnce({
        data: {
          results: [],
        },
      });

      EnterpriseCatalogApiService.createEnterpriseCurationConfig.mockResolvedValueOnce({
        data: mockEnterpriseCurationConfig,
      });

      const args = {
        enterpriseId: TEST_ENTERPRISE_UUID,
        curationTitleForCreation: TEST_ENTERPRISE_NAME,
      };
      const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCuration(args));

      expect(result.current).toEqual({
        isLoading: true,
        fetchError: null,
        enterpriseCuration: null,
      });

      await waitForNextUpdate();

      expect(
        EnterpriseCatalogApiService.getEnterpriseCurationConfig,
      ).toHaveBeenCalled();
      expect(
        EnterpriseCatalogApiService.createEnterpriseCurationConfig,
      ).toHaveBeenCalled();

      expect(result.current).toEqual({
        isLoading: false,
        fetchError: null,
        enterpriseCuration: expect.objectContaining(mockEnterpriseCurationConfig),
      });
    });

    it('should handle fetch error while retrieving existing enterprise curation config', async () => {
      const mockErrorMessage = 'oh noes!';
      EnterpriseCatalogApiService.getEnterpriseCurationConfig.mockRejectedValueOnce(mockErrorMessage);

      const args = {
        enterpriseId: TEST_ENTERPRISE_UUID,
        curationTitleForCreation: TEST_ENTERPRISE_NAME,
      };
      const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCuration(args));

      expect(result.current).toEqual({
        isLoading: true,
        fetchError: null,
        enterpriseCuration: null,
      });

      await waitForNextUpdate();

      expect(
        EnterpriseCatalogApiService.getEnterpriseCurationConfig,
      ).toHaveBeenCalled();

      expect(result.current).toEqual({
        isLoading: false,
        fetchError: mockErrorMessage,
        enterpriseCuration: null,
      });
    });

    it('should handle fetch error while creating enterprise curation config', async () => {
      const mockErrorMessage = 'oh noes!';
      EnterpriseCatalogApiService.getEnterpriseCurationConfig.mockResolvedValueOnce({
        data: {
          results: [],
        },
      });

      EnterpriseCatalogApiService.createEnterpriseCurationConfig.mockRejectedValueOnce(mockErrorMessage);

      const args = {
        enterpriseId: TEST_ENTERPRISE_UUID,
        curationTitleForCreation: TEST_ENTERPRISE_NAME,
      };
      const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCuration(args));

      expect(result.current).toEqual({
        isLoading: true,
        fetchError: null,
        enterpriseCuration: null,
      });

      await waitForNextUpdate();

      expect(
        EnterpriseCatalogApiService.getEnterpriseCurationConfig,
      ).toHaveBeenCalled();

      expect(result.current).toEqual({
        isLoading: false,
        fetchError: mockErrorMessage,
        enterpriseCuration: null,
      });
    });
  });
});