import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Modal from '@/components/molecules/Modal';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);
  const itemsPerPage = 20;

  // Initialize ApperClient
  const getApperClient = () => {
    const { ApperClient } = window.ApperSDK;
    return new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  };

  // Fetch deals with filtering and pagination
  const fetchDeals = async (page = 1, search = '', status = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Amount"}},
          {"field": {"Name": "Stage"}},
          {"field": {"Name": "ExpectedCloseDate"}},
          {"field": {"Name": "AccountName"}},
          {"field": {"Name": "ContactName"}},
          {"field": {"Name": "Probability"}},
          {"field": {"Name": "CreatedDate"}}
        ],
        where: [],
        orderBy: [{"fieldName": "CreatedDate", "sorttype": "DESC"}],
        pagingInfo: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage
        }
      };

      // Add search filter
      if (search.trim()) {
        params.where.push({
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [search.trim()],
          "Include": true
        });
      }

      // Add status filter
      if (status !== 'all') {
        params.where.push({
          "FieldName": "Stage",
          "Operator": "EqualTo",
          "Values": [status],
          "Include": true
        });
      }

      const response = await apperClient.fetchRecords('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        setError(response.message);
        toast.error(response.message);
        return;
      }

      setDeals(response.data || []);
      setTotalDeals(response.total || 0);
    } catch (err) {
      console.error("Error fetching deals:", err?.response?.data?.message || err);
      setError("Failed to load deals. Please try again.");
      toast.error("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create new deal
  const handleCreateDeal = async (dealData) => {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: dealData.name,
          Amount: parseFloat(dealData.amount) || 0,
          Stage: dealData.stage,
          ExpectedCloseDate: dealData.expectedCloseDate,
          AccountName: dealData.accountName,
          ContactName: dealData.contactName,
          Probability: parseInt(dealData.probability) || 0
        }]
      };

      const response = await apperClient.createRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return;
        }
      }

      toast.success('Deal created successfully');
      setIsCreateModalOpen(false);
      fetchDeals(currentPage, searchQuery, statusFilter);
    } catch (err) {
      console.error("Error creating deal:", err?.response?.data?.message || err);
      toast.error("Failed to create deal. Please try again.");
    }
  };

  // Update existing deal
  const handleUpdateDeal = async (dealData) => {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: selectedDeal.Id,
          Name: dealData.name,
          Amount: parseFloat(dealData.amount) || 0,
          Stage: dealData.stage,
          ExpectedCloseDate: dealData.expectedCloseDate,
          AccountName: dealData.accountName,
          ContactName: dealData.contactName,
          Probability: parseInt(dealData.probability) || 0
        }]
      };

      const response = await apperClient.updateRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return;
        }
      }

      toast.success('Deal updated successfully');
      setIsEditModalOpen(false);
      setSelectedDeal(null);
      fetchDeals(currentPage, searchQuery, statusFilter);
    } catch (err) {
      console.error("Error updating deal:", err?.response?.data?.message || err);
      toast.error("Failed to update deal. Please try again.");
    }
  };

  // Delete deal
  const handleDeleteDeal = async (dealId) => {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [dealId]
      };

      const response = await apperClient.deleteRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return;
        }
      }

      toast.success('Deal deleted successfully');
      setDeleteConfirm(null);
      fetchDeals(currentPage, searchQuery, statusFilter);
    } catch (err) {
      console.error("Error deleting deal:", err?.response?.data?.message || err);
      toast.error("Failed to delete deal. Please try again.");
    }
  };

  // Load deals on component mount and when filters change
  useEffect(() => {
    fetchDeals(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter]);

  // Handle search with debouncing
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  // Handle edit deal
  const handleEditClick = (deal) => {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStageColor = (stage) => {
    const colors = {
      'Prospecting': 'bg-blue-100 text-blue-800',
      'Qualification': 'bg-yellow-100 text-yellow-800',
      'Proposal': 'bg-orange-100 text-orange-800',
      'Negotiation': 'bg-purple-100 text-purple-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading && currentPage === 1) {
    return <Loading />;
  }

  if (error && deals.length === 0) {
    return <Error message={error} onRetry={() => fetchDeals(currentPage, searchQuery, statusFilter)} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 mt-1">Manage your sales opportunities</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          New Deal
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Stages</option>
              <option value="Prospecting">Prospecting</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Deals Table */}
      <Card className="overflow-hidden">
        {deals.length === 0 && !loading ? (
          <Empty 
            title="No deals found"
            description="Get started by creating your first deal"
            action={
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Create Deal
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals.map((deal) => (
                  <tr key={deal.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deal.Name}</div>
                      {deal.ContactName && (
                        <div className="text-sm text-gray-500">{deal.ContactName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deal.AccountName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(deal.Amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.Stage)}`}>
                        {deal.Stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deal.Probability}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(deal.ExpectedCloseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(deal)}
                          className="text-primary hover:text-primary-dark p-1 rounded"
                          title="Edit deal"
                        >
                          <ApperIcon name="Pencil" size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(deal)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Delete deal"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && currentPage > 1 && (
              <div className="p-4 text-center">
                <div className="inline-flex items-center">
                  <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                  Loading more deals...
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalDeals > itemsPerPage && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalDeals)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalDeals)} of {totalDeals} deals
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= totalDeals}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      <DealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDeal}
        title="Create New Deal"
      />

      {/* Edit Deal Modal */}
      <DealModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDeal(null);
        }}
        onSubmit={handleUpdateDeal}
        title="Edit Deal"
        initialData={selectedDeal}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal isOpen={true} onClose={() => setDeleteConfirm(null)}>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the deal "{deleteConfirm.Name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteDeal(deleteConfirm.Id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Deal Form Modal Component
const DealModal = ({ isOpen, onClose, onSubmit, title, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    accountName: '',
    contactName: '',
    amount: '',
    stage: 'Prospecting',
    probability: '',
    expectedCloseDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.Name || '',
        accountName: initialData.AccountName || '',
        contactName: initialData.ContactName || '',
        amount: initialData.Amount || '',
        stage: initialData.Stage || 'Prospecting',
        probability: initialData.Probability || '',
        expectedCloseDate: initialData.ExpectedCloseDate ? initialData.ExpectedCloseDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        accountName: '',
        contactName: '',
        amount: '',
        stage: 'Prospecting',
        probability: '',
        expectedCloseDate: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Deal name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">{title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter deal name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name
            </label>
            <Input
              value={formData.accountName}
              onChange={(e) => handleChange('accountName', e.target.value)}
              placeholder="Enter account name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <Input
              value={formData.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
              placeholder="Enter contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Probability (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => handleChange('probability', e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <select
              value={formData.stage}
              onChange={(e) => handleChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="Prospecting">Prospecting</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Close Date
            </label>
            <Input
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              initialData ? 'Update Deal' : 'Create Deal'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Deals;