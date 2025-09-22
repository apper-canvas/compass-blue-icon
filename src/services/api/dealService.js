// Deal Service - ApperClient Integration
// Handles CRUD operations for deals with proper field visibility and lookup handling

// Utility function to create delay for realistic API simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class DealService {
  constructor() {
    // Initialize ApperClient
    this.tableName = 'deal_c';
    
    // Define lookup fields for special handling
    this.lookupFields = ['contactId_c'];
    
    // Define field visibility for proper CRUD operations
    this.updateableFields = [
      'title_c',
      'description_c', 
      'value_c',
      'stage_c',
      'contactId_c'
    ];
  }

  // Initialize ApperClient instance
  getApperClient() {
    const { ApperClient } = window.ApperSDK;
    return new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  // Prepare lookup fields for create/update operations (send only ID values)
  prepareLookupFields(data) {
    const prepared = {...data};
    this.lookupFields.forEach(fieldName => {
      if (prepared[fieldName] !== undefined && prepared[fieldName] !== null) {
        // Handle both object and direct ID inputs
        prepared[fieldName] = prepared[fieldName]?.Id || prepared[fieldName];
        // Ensure integer conversion for lookup fields
        if (prepared[fieldName]) {
          prepared[fieldName] = parseInt(prepared[fieldName]);
        }
      }
    });
    return prepared;
  }

  // Filter fields based on visibility for create/update operations
  filterUpdateableFields(data) {
    const filtered = {};
    this.updateableFields.forEach(field => {
      if (data[field] !== undefined) {
        filtered[field] = data[field];
      }
    });
    return filtered;
  }

  // Get all deals with contact lookup relationships
  async getAll() {
    try {
      await delay(350); // Realistic API delay

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "CreatedDate"}},
          {"field": {"Name": "LastModifiedDate"}}
        ],
        orderBy: [{"fieldName": "LastModifiedDate", "sorttype": "DESC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      const apperClient = this.getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error("Error fetching deals:", response.message);
        throw new Error(response.message);
      }

      // Handle empty results
      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Return data with proper field mapping for component usage
      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c || '',
        description: deal.description_c || '',
        value: deal.value_c || 0,
        stage: deal.stage_c || '',
        contactId: deal.contactId_c?.Id || deal.contactId_c || null,
        contactName: deal.contactId_c?.Name || null,
        createdDate: deal.CreatedDate,
        lastModifiedDate: deal.LastModifiedDate
      }));

    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  }

  // Get single deal by ID
  async getById(dealId) {
    try {
      if (!dealId) {
        throw new Error("Deal ID is required");
      }

      await delay(300);

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "CreatedDate"}},
          {"field": {"Name": "LastModifiedDate"}}
        ]
      };

      const apperClient = this.getApperClient();
      const response = await apperClient.getRecordById(this.tableName, parseInt(dealId), params);

      if (!response.success) {
        console.error(`Error fetching deal ${dealId}:`, response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        return null;
      }

      // Return data with proper field mapping
      return {
        Id: response.data.Id,
        title: response.data.title_c || '',
        description: response.data.description_c || '',
        value: response.data.value_c || 0,
        stage: response.data.stage_c || '',
        contactId: response.data.contactId_c?.Id || response.data.contactId_c || null,
        contactName: response.data.contactId_c?.Name || null,
        createdDate: response.data.CreatedDate,
        lastModifiedDate: response.data.LastModifiedDate
      };

    } catch (error) {
      console.error(`Error fetching deal ${dealId}:`, error?.response?.data?.message || error.message || error);
      return null;
    }
  }

  // Create new deal
  async create(dealData) {
    try {
      await delay(400);

      // Filter to only updateable fields
      const filteredData = this.filterUpdateableFields({
        title_c: dealData.title || '',
        description_c: dealData.description || '',
        value_c: dealData.value || 0,
        stage_c: dealData.stage || 'New',
        contactId_c: dealData.contactId || null
      });

      // Prepare lookup fields (convert to ID integers)
      const preparedData = this.prepareLookupFields(filteredData);

      const params = {
        records: [preparedData]
      };

      const apperClient = this.getApperClient();
      const response = await apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error("Error creating deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("No successful records created");

    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  }

  // Update existing deal
  async update(dealId, dealData) {
    try {
      if (!dealId) {
        throw new Error("Deal ID is required for update");
      }

      await delay(400);

      // Filter to only updateable fields
      const filteredData = this.filterUpdateableFields({
        title_c: dealData.title,
        description_c: dealData.description,
        value_c: dealData.value,
        stage_c: dealData.stage,
        contactId_c: dealData.contactId
      });

      // Prepare lookup fields (convert to ID integers)
      const preparedData = this.prepareLookupFields({
        Id: parseInt(dealId),
        ...filteredData
      });

      const params = {
        records: [preparedData]
      };

      const apperClient = this.getApperClient();
      const response = await apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error("Error updating deal:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("No successful records updated");

    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  }

  // Delete deal(s)
  async delete(dealIds) {
    try {
      if (!dealIds) {
        throw new Error("Deal ID(s) required for deletion");
      }

      await delay(300);

      // Ensure dealIds is an array
      const idsArray = Array.isArray(dealIds) ? dealIds : [dealIds];
      const intIds = idsArray.map(id => parseInt(id));

      const params = {
        RecordIds: intIds
      };

      const apperClient = this.getApperClient();
      const response = await apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error("Error deleting deals:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) {
              console.error(`Delete failed: ${record.message}`);
            }
          });
        }

        return successful.length === idsArray.length;
      }

      return false;

    } catch (error) {
      console.error("Error deleting deals:", error?.response?.data?.message || error.message || error);
      throw error;
    }
  }

  // Get deals by contact ID (helper method for contact-deal relationships)
  async getByContactId(contactId) {
    try {
      if (!contactId) {
        throw new Error("Contact ID is required");
      }

      await delay(300);

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "contactId_c"}}
        ],
        where: [{
          "FieldName": "contactId_c",
          "Operator": "EqualTo",
          "Values": [parseInt(contactId)],
          "Include": true
        }],
        orderBy: [{"fieldName": "LastModifiedDate", "sorttype": "DESC"}]
      };

      const apperClient = this.getApperClient();
      const response = await apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(`Error fetching deals for contact ${contactId}:`, response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(deal => ({
        Id: deal.Id,
        title: deal.title_c || '',
        description: deal.description_c || '',
        value: deal.value_c || 0,
        stage: deal.stage_c || '',
        contactId: deal.contactId_c?.Id || deal.contactId_c || null
      }));

    } catch (error) {
      console.error(`Error fetching deals for contact ${contactId}:`, error?.response?.data?.message || error.message || error);
      return [];
    }
  }
}

// Export singleton instance
export const dealService = new DealService();