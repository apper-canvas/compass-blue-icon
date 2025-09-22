import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Modal from '@/components/molecules/Modal';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { companiesService } from '@/services/api/companiesService';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getAll();
      setCompanies(data || []);
    } catch (err) {
      console.error('Error loading companies:', err?.response?.data?.message || err);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(company =>
      company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phoneNumber?.includes(searchTerm)
    );
    setFilteredCompanies(filtered);
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setFormData({
      companyName: '',
      industry: '',
      website: '',
      phoneNumber: '',
      emailAddress: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    });
    setIsModalOpen(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || '',
      industry: company.industry || '',
      website: company.website || '',
      phoneNumber: company.phoneNumber || '',
      emailAddress: company.emailAddress || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      postalCode: company.postalCode || '',
      country: company.country || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (company) => {
    if (!window.confirm(`Are you sure you want to delete ${company.companyName}?`)) {
      return;
    }

    try {
      setDeleteLoading(company.Id);
      await companiesService.delete(company.Id);
      setCompanies(prev => prev.filter(c => c.Id !== company.Id));
      toast.success('Company deleted successfully');
    } catch (err) {
      console.error('Error deleting company:', err?.response?.data?.message || err);
      toast.error('Failed to delete company. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      setFormLoading(true);
      
      if (editingCompany) {
        const updated = await companiesService.update(editingCompany.Id, formData);
        setCompanies(prev => prev.map(c => c.Id === editingCompany.Id ? updated : c));
        toast.success('Company updated successfully');
      } else {
        const created = await companiesService.create(formData);
        setCompanies(prev => [...prev, created]);
        toast.success('Company created successfully');
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving company:', err?.response?.data?.message || err);
      toast.error('Failed to save company. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCompanies} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage your company relationships</p>
        </div>
        <Button onClick={handleAddCompany} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Company
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search companies..."
            className="w-full"
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <Empty
          icon="Building2"
          title="No companies found"
          description={searchTerm ? "No companies match your search criteria" : "Get started by adding your first company"}
          action={!searchTerm ? (
            <Button onClick={handleAddCompany} className="flex items-center gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Company
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.Id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ApperIcon name="Building2" size={24} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {company.companyName}
                    </h3>
                    {company.industry && (
                      <p className="text-sm text-gray-500 truncate">{company.industry}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCompany(company)}
                    className="h-8 w-8 p-0"
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCompany(company)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleteLoading === company.Id}
                  >
                    {deleteLoading === company.Id ? (
                      <ApperIcon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <ApperIcon name="Trash2" size={14} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {company.emailAddress && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Mail" size={14} />
                    <span className="truncate">{company.emailAddress}</span>
                  </div>
                )}
                {company.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Phone" size={14} />
                    <span>{company.phoneNumber}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="Globe" size={14} />
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-blue-600 hover:text-blue-700"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {(company.city || company.state || company.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="MapPin" size={14} />
                    <span className="truncate">
                      {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Edit Company' : 'Add Company'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleFormChange}
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <Input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleFormChange}
                placeholder="Enter industry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleFormChange}
                placeholder="Enter website URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFormChange}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleFormChange}
                placeholder="Enter email address"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleFormChange}
                placeholder="Enter state or province"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <Input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleFormChange}
                placeholder="Enter postal code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <Input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleFormChange}
                placeholder="Enter country"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2"
            >
              {formLoading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
              {editingCompany ? 'Update Company' : 'Add Company'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Companies;