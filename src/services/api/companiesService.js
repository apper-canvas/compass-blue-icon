import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const TABLE_NAME = 'companies_c';

export const companiesService = {
  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "companyName"}},
          {"field": {"Name": "industry"}},
          {"field": {"Name": "website"}},
          {"field": {"Name": "phoneNumber"}},
          {"field": {"Name": "emailAddress"}},
          {"field": {"Name": "address"}},
          {"field": {"Name": "city"}},
          {"field": {"Name": "state"}},
          {"field": {"Name": "postalCode"}},
          {"field": {"Name": "country"}}
        ],
        orderBy: [{"fieldName": "companyName", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error('Error fetching companies:', response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching companies:', error?.response?.data?.message || error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "companyName"}},
          {"field": {"Name": "industry"}},
          {"field": {"Name": "website"}},
          {"field": {"Name": "phoneNumber"}},
          {"field": {"Name": "emailAddress"}},
          {"field": {"Name": "address"}},
          {"field": {"Name": "city"}},
          {"field": {"Name": "state"}},
          {"field": {"Name": "postalCode"}},
          {"field": {"Name": "country"}}
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, id, params);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(companyData) {
    try {
      const params = {
        records: [{
          companyName: companyData.companyName,
          industry: companyData.industry || null,
          website: companyData.website || null,
          phoneNumber: companyData.phoneNumber || null,
          emailAddress: companyData.emailAddress || null,
          address: companyData.address || null,
          city: companyData.city || null,
          state: companyData.state || null,
          postalCode: companyData.postalCode || null,
          country: companyData.country || null
        }]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error('Error creating company:', response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create company:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to create company');
        }
        
        return successful[0]?.data;
      }
    } catch (error) {
      console.error('Error creating company:', error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, companyData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          companyName: companyData.companyName,
          industry: companyData.industry || null,
          website: companyData.website || null,
          phoneNumber: companyData.phoneNumber || null,
          emailAddress: companyData.emailAddress || null,
          address: companyData.address || null,
          city: companyData.city || null,
          state: companyData.state || null,
          postalCode: companyData.postalCode || null,
          country: companyData.country || null
        }]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error('Error updating company:', response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update company:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            }
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update company');
        }
        
        return successful[0]?.data;
      }
    } catch (error) {
      console.error('Error updating company:', error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error('Error deleting company:', response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete company:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to delete company');
        }
        
        return successful.length > 0;
      }
    } catch (error) {
      console.error('Error deleting company:', error?.response?.data?.message || error);
      throw error;
    }
  }
};