import { toast } from 'react-toastify';

const tableName = 'contact_c';

export const contactService = {
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
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_activity_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to fetch contacts:", response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database fields to UI format
      const transformedData = (response.data || []).map(contact => ({
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        status: contact.status_c || 'lead',
        createdAt: contact.created_at_c || contact.CreatedOn,
        lastActivity: contact.last_activity_c || contact.ModifiedOn
      }));

      return transformedData;
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
      toast.error("Failed to load contacts");
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
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_activity_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);

      if (!response?.data) {
        return null;
      }

      // Transform database fields to UI format
      const contact = response.data;
      return {
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        status: contact.status_c || 'lead',
        createdAt: contact.created_at_c || contact.CreatedOn,
        lastActivity: contact.last_activity_c || contact.ModifiedOn
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(contactData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Transform UI fields to database fields and include only Updateable fields
      const dbData = {
        Name: `${contactData.firstName} ${contactData.lastName}`,
        first_name_c: contactData.firstName,
        last_name_c: contactData.lastName,
        email_c: contactData.email,
        phone_c: contactData.phone || '',
        company_c: contactData.company,
        status_c: contactData.status || 'lead',
        created_at_c: new Date().toISOString(),
        last_activity_c: new Date().toISOString()
      };

      const params = {
        records: [dbData]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to create contact:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create contact:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdContact = successful[0].data;
          return {
            Id: createdContact.Id,
            firstName: createdContact.first_name_c || '',
            lastName: createdContact.last_name_c || '',
            email: createdContact.email_c || '',
            phone: createdContact.phone_c || '',
            company: createdContact.company_c || '',
            status: createdContact.status_c || 'lead',
            createdAt: createdContact.created_at_c || createdContact.CreatedOn,
            lastActivity: createdContact.last_activity_c || createdContact.ModifiedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      toast.error("Failed to create contact");
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
        Id: parseInt(id),
        Name: `${updateData.firstName} ${updateData.lastName}`,
        first_name_c: updateData.firstName,
        last_name_c: updateData.lastName,
        email_c: updateData.email,
        phone_c: updateData.phone || '',
        company_c: updateData.company,
        status_c: updateData.status || 'lead',
        last_activity_c: new Date().toISOString()
      };

      const params = {
        records: [dbData]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to update contact:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update contact:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel || 'Field'}: ${error.message || error}`));
            }
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedContact = successful[0].data;
          return {
            Id: updatedContact.Id,
            firstName: updatedContact.first_name_c || '',
            lastName: updatedContact.last_name_c || '',
            email: updatedContact.email_c || '',
            phone: updatedContact.phone_c || '',
            company: updatedContact.company_c || '',
            status: updatedContact.status_c || 'lead',
            createdAt: updatedContact.created_at_c || updatedContact.CreatedOn,
            lastActivity: updatedContact.last_activity_c || updatedContact.ModifiedOn
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
      toast.error("Failed to update contact");
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
        console.error("Failed to delete contact:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete contact:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      toast.error("Failed to delete contact");
      return false;
    }
  },

  async search(query) {
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
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_activity_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "first_name_c", "operator": "Contains", "values": [query]},
                {"fieldName": "last_name_c", "operator": "Contains", "values": [query]},
                {"fieldName": "email_c", "operator": "Contains", "values": [query]},
                {"fieldName": "company_c", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            }
          ]
        }],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to search contacts:", response.message);
        return [];
      }

      // Transform database fields to UI format
      const transformedData = (response.data || []).map(contact => ({
        Id: contact.Id,
        firstName: contact.first_name_c || '',
        lastName: contact.last_name_c || '',
        email: contact.email_c || '',
        phone: contact.phone_c || '',
        company: contact.company_c || '',
        status: contact.status_c || 'lead',
        createdAt: contact.created_at_c || contact.CreatedOn,
        lastActivity: contact.last_activity_c || contact.ModifiedOn
      }));

      return transformedData;
    } catch (error) {
      console.error("Error searching contacts:", error?.response?.data?.message || error);
      return [];
    }
  }
};