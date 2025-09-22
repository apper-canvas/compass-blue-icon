import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import Activities from "@/components/pages/Activities";
import Deals from "@/components/pages/Deals";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedContact, setSelectedContact] = useState(null);
  const [contactActivities, setContactActivities] = useState([]);
  const [contactDeals, setContactDeals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "lead"
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

const loadContactDetails = async (contactId) => {
    try {
      const activities = await activityService.getByContact(contactId);
      setContactActivities(activities);
    } catch (err) {
      toast.error("Failed to load contact details");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    let filtered = contacts;

if (searchTerm) {
      filtered = filtered.filter(contact =>
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter]);

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setSelectedContact(contact);
setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        status: contact.status
      });
setIsEditing(true);
      loadContactDetails(contact.id);
    } else {
      setSelectedContact(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        status: "lead"
      });
      setIsEditing(false);
      setContactActivities([]);
      setContactDeals([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
    setIsEditing(false);
    setContactActivities([]);
    setContactDeals([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
if (isEditing) {
        await contactService.update(selectedContact.id, formData);
        toast.success("Contact updated successfully");
      } else {
        await contactService.create(formData);
        toast.success("Contact created successfully");
      }
      await loadContacts();
      handleCloseModal();
    } catch (err) {
      toast.error(`Failed to ${isEditing ? "update" : "create"} contact`);
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(contactId);
        toast.success("Contact deleted successfully");
await loadContacts();
        if (selectedContact && selectedContact.id === contactId) {
          handleCloseModal();
        }
      } catch (err) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      lead: "default",
      qualified: "info",
      prospect: "warning",
      customer: "success"
    };
    return variants[status] || "default";
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Users";
      default: return "MessageCircle";
    }
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadContacts} />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Contacts</h1>
        <Button onClick={() => handleOpenModal()} variant="accent">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search contacts..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="lead">Lead</option>
          <option value="qualified">Qualified</option>
          <option value="prospect">Prospect</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Empty
          title="No contacts found"
          description={searchTerm || statusFilter !== "all" ? 
            "Try adjusting your search or filters" : 
            "Get started by adding your first contact"
          }
          icon="Users"
          actionText={!searchTerm && statusFilter === "all" ? "Add Contact" : undefined}
          onAction={!searchTerm && statusFilter === "all" ? () => handleOpenModal() : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                hover 
                className="p-6 cursor-pointer"
                onClick={() => handleOpenModal(contact)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </span>
                  </div>
                  <Badge variant={getStatusBadge(contact.status)} size="sm">
                    {contact.status.replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-sm text-slate-500 mb-3">{contact.email}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Created {format(new Date(contact.createdAt), "MMM dd, yyyy")}</span>
                  <span>Last activity {format(new Date(contact.lastActivity), "MMM dd")}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Contact Details" : "Add New Contact"}
        size="lg"
      >
        {isEditing ? (
          <div className="space-y-6">
            {/* Contact Info Tab */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                <button className="py-2 px-1 border-b-2 border-primary font-medium text-sm text-primary">
                  Contact Info
                </button>
                <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-slate-500 hover:text-slate-700">
                  Activities ({contactActivities.length})
                </button>
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                  required
                />
              </div>
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
variant="outline"
                  onClick={() => handleDelete(selectedContact.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" size={16} className="mr-2" />
                  Delete
                </Button>
                <div className="space-x-3">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Update Contact
                  </Button>
                </div>
              </div>
            </form>

            {/* Recent Activities */}
            {contactActivities.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Recent Activities</h4>
                <div className="space-y-3">
{contactActivities.slice(0, 3).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <ApperIcon name={getActivityIcon(activity.type)} size={14} className="text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(activity.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                required
              />
            </div>
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Contact
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Contacts;