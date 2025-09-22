import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import { eachMonthOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns";
import React from "react";
import Error from "@/components/ui/Error";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const reportsService = {
  async getAnalytics(timeframe = '6months') {
    await delay(500);
    
try {
      // Get data from services
      const [contacts, activities] = await Promise.all([
        contactService.getAll(),
        activityService.getAll()
      ]);

      // Calculate timeframe dates
      const monthsBack = timeframe === '3months' ? 3 : timeframe === '12months' ? 12 : 6;
      const endDate = new Date();
      const startDate = subMonths(endDate, monthsBack);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

// Calculate conversion rate metrics
      const conversionRate = {
        rate: 0,
        trend: 0
      };
      
      // Calculate lead generation metrics
      const leadGeneration = calculateLeadGeneration(contacts, months);
      
      // Calculate customer acquisition cost
      const customerAcquisition = {
        cost: 0,
        trend: 0
      };
      
      // Calculate pipeline analysis
      const pipelineAnalysis = {
        totalValue: 0,
        averageDealSize: 0
      };
      
      // Calculate revenue metrics
      const revenue = {
        total: 0,
        monthly: []
      };

      return {
        leadGeneration,
        conversionRate,
        customerAcquisition,
        pipelineAnalysis,
        revenue,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw new Error('Failed to generate analytics data');
    }
  }
};


function calculateLeadGeneration(contacts, months) {
  const monthly = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // New contacts (leads) created in this month
    const newLeads = contacts.filter(contact => {
      const contactDate = parseISO(contact.createdAt);
      return contactDate >= monthStart && contactDate <= monthEnd;
    }).length;
    
return {
      month: format(month, 'yyyy-MM-dd'),
      newLeads,
      qualifiedLeads: 0, // No longer tracking deal-based qualification
      qualificationRate: 0
    };
  });

  const totalNewLeads = monthly.reduce((sum, month) => sum + month.newLeads, 0);
  const monthlyAverage = Math.round(totalNewLeads / monthly.length);
  
  // Calculate trend (comparing last two months)
  const currentMonth = monthly[monthly.length - 1];
  const previousMonth = monthly[monthly.length - 2];
  const trend = previousMonth && previousMonth.newLeads > 0 
    ? ((currentMonth.newLeads - previousMonth.newLeads) / previousMonth.newLeads) * 100 
    : 0;

  return {
    monthly,
    monthlyAverage,
    totalNewLeads,
    trend: parseFloat(trend.toFixed(2))
  };
}