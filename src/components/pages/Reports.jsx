import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { eachMonthOfInterval, endOfMonth, format, isValid, startOfMonth, subMonths } from "date-fns";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import { reportsService } from "@/services/api/reportsService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeframe, setTimeframe] = useState('6months');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadAnalyticsData} />;
  if (!analyticsData) return <Error message="No analytics data available" onRetry={loadAnalyticsData} />;

  const {
    conversionRate,
    conversionTrend,
    leadGeneration,
    customerAcquisitionCost,
    pipelineAnalysis,
    revenueMetrics
  } = analyticsData;

  // Chart configurations
  const conversionChartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    colors: ['#1e3a8a', '#10b981'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 0.9
},
xaxis: {
      categories: conversionTrend?.map(item => {
        const date = new Date(item?.month);
        return isValid(date) ? format(date, 'MMM yyyy') : 'Invalid Date';
      }) || [],
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value.toFixed(1)}%`,
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toFixed(1)}%`
      }
    }
  };

const conversionChartSeries = [{
    name: 'Conversion Rate',
    data: conversionTrend?.map(item => item?.rate || 0) || []
  }];
  const leadGenChartOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false },
      fontFamily: 'Inter, system-ui, sans-serif'
    },
colors: ['#f59e0b', '#8b5cf6'],
xaxis: {
      categories: leadGeneration?.monthly?.map(item => {
        const date = new Date(item?.month);
        return isValid(date) ? format(date, 'MMM yyyy') : 'Invalid Date';
      }) || [],
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%'
      }
    }
  };

const leadGenChartSeries = [{
    name: 'New Leads',
    data: leadGeneration?.monthly?.map(item => item?.newLeads || 0) || []
  }, {
    name: 'Qualified Leads',
    data: leadGeneration?.monthly?.map(item => item?.qualifiedLeads || 0) || []
  }];
  const pipelineChartOptions = {
    chart: {
      type: 'donut',
      height: 300,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
colors: ['#1e3a8a', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
    labels: pipelineAnalysis?.byStage?.map(item => 
      item?.stage?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'
    ) || [],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
label: 'Total Value',
              formatter: () => `$${(pipelineAnalysis?.totalValue || 0).toLocaleString()}`
            }
          }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  };

const pipelineChartSeries = pipelineAnalysis?.byStage?.map(item => item?.value || 0) || [];

  const revenueChartOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    colors: ['#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
},
xaxis: {
      categories: revenueMetrics?.monthly?.map(item => {
        const date = new Date(item?.month);
        return isValid(date) ? format(date, 'MMM yyyy') : 'Invalid Date';
      }) || [],
      labels: {
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${(value / 1000).toFixed(0)}K`,
        style: {
          fontSize: '12px',
          colors: '#64748b'
        }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  };

const revenueChartSeries = [{
    name: 'Revenue',
    data: revenueMetrics?.monthly?.map(item => item?.revenue || 0) || []
  }];
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Comprehensive insights into your sales performance and metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <ApperIcon name="RefreshCw" size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="TrendingUp" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-800">{conversionRate.current.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <ApperIcon 
                    name={conversionRate.trend > 0 ? "ArrowUp" : "ArrowDown"} 
                    size={12} 
                    className={conversionRate.trend > 0 ? "text-green-600" : "text-red-600"} 
                  />
                  <span className={`text-xs ml-1 ${conversionRate.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(conversionRate.trend).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="Users" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Leads</p>
                <p className="text-2xl font-bold text-slate-800">{leadGeneration.monthlyAverage}</p>
                <div className="flex items-center mt-1">
                  <ApperIcon 
                    name={leadGeneration.trend > 0 ? "ArrowUp" : "ArrowDown"} 
                    size={12} 
                    className={leadGeneration.trend > 0 ? "text-green-600" : "text-red-600"} 
                  />
                  <span className={`text-xs ml-1 ${leadGeneration.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(leadGeneration.trend).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="DollarSign" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Avg CAC</p>
                <p className="text-2xl font-bold text-slate-800">${customerAcquisitionCost.average.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ApperIcon 
                    name={customerAcquisitionCost.trend < 0 ? "ArrowDown" : "ArrowUp"} 
                    size={12} 
                    className={customerAcquisitionCost.trend < 0 ? "text-green-600" : "text-red-600"} 
                  />
                  <span className={`text-xs ml-1 ${customerAcquisitionCost.trend < 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(customerAcquisitionCost.trend).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg flex items-center justify-center mr-4">
                <ApperIcon name="Target" size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Pipeline Value</p>
                <p className="text-2xl font-bold text-slate-800">${pipelineAnalysis.totalValue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="success" size="sm">
                    {pipelineAnalysis.activeDeals} active
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Rate Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Sales Conversion Rate</h3>
              <ApperIcon name="TrendingUp" size={20} className="text-slate-400" />
            </div>
            <Chart
              options={conversionChartOptions}
              series={conversionChartSeries}
              type="line"
              height={300}
            />
          </Card>
        </motion.div>

        {/* Lead Generation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Lead Generation</h3>
              <ApperIcon name="Users" size={20} className="text-slate-400" />
            </div>
            <Chart
              options={leadGenChartOptions}
              series={leadGenChartSeries}
              type="bar"
              height={300}
            />
          </Card>
        </motion.div>

        {/* Pipeline Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Pipeline Distribution</h3>
              <ApperIcon name="PieChart" size={20} className="text-slate-400" />
            </div>
            <Chart
              options={pipelineChartOptions}
              series={pipelineChartSeries}
              type="donut"
              height={300}
            />
          </Card>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
              <ApperIcon name="DollarSign" size={20} className="text-slate-400" />
            </div>
            <Chart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="area"
              height={300}
            />
          </Card>
        </motion.div>
      </div>

      {/* Customer Acquisition Cost Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Customer Acquisition Cost Analysis</h3>
            <ApperIcon name="Calculator" size={20} className="text-slate-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">${customerAcquisitionCost.average.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Average CAC</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">${customerAcquisitionCost.lowest.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Lowest CAC</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">${customerAcquisitionCost.highest.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Highest CAC</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <ApperIcon name="Info" size={16} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">CAC Analysis</p>
                <p className="text-sm text-blue-600 mt-1">
                  Customer Acquisition Cost is calculated based on deal values and conversion rates. 
                  A lower CAC indicates more efficient lead generation and sales processes.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default Reports;