import { toast } from 'react-toastify';

const tableName = 'activity_c';

export const activityService = {
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
{"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to fetch activities:", response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database fields to UI format
      const transformedData = (response.data || []).map(activity => ({
        Id: activity.Id,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c || null,
        type: activity.type_c || 'call',
        description: activity.description_c || '',
        createdAt: activity.created_at_c || activity.CreatedOn
      }));

      return transformedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      toast.error("Failed to load activities");
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
          {"field": {"Name": "contact_id_c"}},
{"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
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
      const activity = response.data;
      return {
        Id: activity.Id,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c || null,
        type: activity.type_c || 'call',
        description: activity.description_c || '',
        createdAt: activity.created_at_c || activity.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(activityData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database fields and include only Updateable fields
      const dbData = {
        Name: `${activityData.type} - ${activityData.description.substring(0, 50)}`,
        contact_id_c: parseInt(activityData.contactId),
        type_c: activityData.type || 'call',
        description_c: activityData.description,
        created_at_c: new Date().toISOString()
      };

      // Only include deal_id_c if dealId is provided and not null

      const params = {
        records: [dbData]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to create activity:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create activity:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdActivity = successful[0].data;
          return {
            Id: createdActivity.Id,
            contactId: createdActivity.contact_id_c?.Id || createdActivity.contact_id_c || null,
            type: createdActivity.type_c || 'call',
            description: createdActivity.description_c || '',
            createdAt: createdActivity.created_at_c || createdActivity.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      toast.error("Failed to create activity");
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
      if (updateData.contactId !== undefined) {
        dbData.contact_id_c = parseInt(updateData.contactId);
      }
      if (updateData.type !== undefined) {
        dbData.type_c = updateData.type;
      }
      if (updateData.description !== undefined) {
        dbData.description_c = updateData.description;
        dbData.Name = `${updateData.type || 'activity'} - ${updateData.description.substring(0, 50)}`;
      }

      const params = {
        records: [dbData]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to update activity:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update activity:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedActivity = successful[0].data;
          return {
            Id: updatedActivity.Id,
            contactId: updatedActivity.contact_id_c?.Id || updatedActivity.contact_id_c || null,
            type: updatedActivity.type_c || 'call',
            description: updatedActivity.description_c || '',
            createdAt: updatedActivity.created_at_c || updatedActivity.CreatedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
      toast.error("Failed to update activity");
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
        console.error("Failed to delete activity:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete activity:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      toast.error("Failed to delete activity");
      return false;
    }
  },

  async getByContact(contactId) {
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
          {"field": {"Name": "contact_id_c"}},
{"field": {"Name": "type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        where: [{"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)]}],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to fetch activities by contact:", response.message);
        return [];
      }

      // Transform database fields to UI format
      const transformedData = (response.data || []).map(activity => ({
        Id: activity.Id,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c || null,
        type: activity.type_c || 'call',
        description: activity.description_c || '',
        createdAt: activity.created_at_c || activity.CreatedOn
      }));

      return transformedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message || error);
      return [];
    }
  }
};