import { toast } from 'react-toastify';

const tableName = 'deal_c';

export const dealService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to fetch deals:", response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database fields to UI format
      const transformedData = (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c || '',
        contactId: deal.contact_id_c?.Id || deal.contact_id_c || null,
        value: parseFloat(deal.value_c) || 0,
        stage: deal.stage_c || 'lead',
        probability: parseInt(deal.probability_c) || 0,
        expectedCloseDate: deal.expected_close_date_c || deal.CreatedOn,
        createdAt: deal.created_at_c || deal.CreatedOn
      }));

      return transformedData;
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      toast.error("Failed to load deals");
      return [];
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response?.data) {
        return null;
      }

      // Transform database fields to UI format
      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title_c || '',
        contactId: deal.contact_id_c?.Id || deal.contact_id_c || null,
        value: parseFloat(deal.value_c) || 0,
        stage: deal.stage_c || 'lead',
        probability: parseInt(deal.probability_c) || 0,
        expectedCloseDate: deal.expected_close_date_c || deal.CreatedOn,
        createdAt: deal.created_at_c || deal.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(dealData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database fields and include only Updateable fields
      const dbData = {
        Name: dealData.title,
        title_c: dealData.title,
        contact_id_c: parseInt(dealData.contactId),
        value_c: parseFloat(dealData.value),
        stage_c: dealData.stage || 'lead',
        probability_c: parseInt(dealData.probability),
        expected_close_date_c: dealData.expectedCloseDate,
        created_at_c: new Date().toISOString()
      };

      const params = {
        records: [dbData]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to create deal:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create deal:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdDeal = successful[0].data;
          return {
            Id: createdDeal.Id,
            title: createdDeal.title_c || '',
            contactId: createdDeal.contact_id_c?.Id || createdDeal.contact_id_c || null,
            value: parseFloat(createdDeal.value_c) || 0,
            stage: createdDeal.stage_c || 'lead',
            probability: parseInt(createdDeal.probability_c) || 0,
            expectedCloseDate: createdDeal.expected_close_date_c || createdDeal.CreatedOn,
            createdAt: createdDeal.created_at_c || createdDeal.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      toast.error("Failed to create deal");
      return null;
    }
  },

  async update(id, updateData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database fields and include only Updateable fields
      const dbData = {
        Id: parseInt(id)
      };

      // Only include fields that are being updated
      if (updateData.title !== undefined) {
        dbData.Name = updateData.title;
        dbData.title_c = updateData.title;
      }
      if (updateData.contactId !== undefined) {
        dbData.contact_id_c = parseInt(updateData.contactId);
      }
      if (updateData.value !== undefined) {
        dbData.value_c = parseFloat(updateData.value);
      }
      if (updateData.stage !== undefined) {
        dbData.stage_c = updateData.stage;
      }
      if (updateData.probability !== undefined) {
        dbData.probability_c = parseInt(updateData.probability);
      }
      if (updateData.expectedCloseDate !== undefined) {
        dbData.expected_close_date_c = updateData.expectedCloseDate;
      }

      const params = {
        records: [dbData]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to update deal:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update deal:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title_c || '',
            contactId: updatedDeal.contact_id_c?.Id || updatedDeal.contact_id_c || null,
            value: parseFloat(updatedDeal.value_c) || 0,
            stage: updatedDeal.stage_c || 'lead',
            probability: parseInt(updatedDeal.probability_c) || 0,
            expectedCloseDate: updatedDeal.expected_close_date_c || updatedDeal.CreatedOn,
            createdAt: updatedDeal.created_at_c || updatedDeal.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      toast.error("Failed to update deal");
      return null;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to delete deal:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete deal:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      toast.error("Failed to delete deal");
      return false;
    }
  },

  async getByStage(stage) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{"FieldName": "stage_c", "Operator": "EqualTo", "Values": [stage]}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to fetch deals by stage:", response.message);
        return [];
      }

      // Transform database fields to UI format
      const transformedData = (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c || '',
        contactId: deal.contact_id_c?.Id || deal.contact_id_c || null,
        value: parseFloat(deal.value_c) || 0,
        stage: deal.stage_c || 'lead',
        probability: parseInt(deal.probability_c) || 0,
        expectedCloseDate: deal.expected_close_date_c || deal.CreatedOn,
        createdAt: deal.created_at_c || deal.CreatedOn
      }));

      return transformedData;
    } catch (error) {
      console.error("Error fetching deals by stage:", error?.response?.data?.message || error);
      return [];
    }
  }
};