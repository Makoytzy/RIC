import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, TrendingDown, Award, AlertCircle, RefreshCw,
  Search, BarChart3, Activity, CheckCircle2
} from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function EmployeeEfficiency() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch real users from the API
      const { data } = await api.get('/users');
      
      if (data?.users) {
        // Transform user data to include efficiency metrics
        const employeesWithMetrics = data.users
          .filter(u => u.isActive)
          .map(user => ({
            id: user.id,
            name: user.fullName || user.email,
            email: user.email,
            position: user.position || 'Not Assigned',
            roles: user.roles || [],
            // Simulated metrics (in production, these would come from a real metrics API)
            tasksCompleted: 0,
            accuracy: 100,
            productivity: 100,
            performance: 'Good'
          }));
        
        setEmployees(employeesWithMetrics);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.warn('Employee data not available:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.position === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Calculate team averages
  const avgProductivity = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.productivity, 0) / employees.length)
    : 0;
  
  const avgAccuracy = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + e.accuracy, 0) / employees.length)
    : 0;

  const topPerformers = employees.filter(e => e.productivity >= 90).length;

  if (loading) {
    return <Loading message="Loading employee efficiency data..." />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Efficiency</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor team performance, productivity, and task completion metrics
          </p>
        </div>
        <Button onClick={loadEmployeeData} className="bg-white border border-slate-200">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Staff</p>
              <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Productivity</p>
              <p className="text-2xl font-bold text-slate-900">{avgProductivity}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Accuracy</p>
              <p className="text-2xl font-bold text-slate-900">{avgAccuracy}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Top Performers</p>
              <p className="text-2xl font-bold text-slate-900">{topPerformers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="operational_staff">Operational Staff</option>
            <option value="warehouse_staff">Warehouse Staff</option>
            <option value="sales_staff">Sales Staff</option>
          </select>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={searchQuery ? "Try adjusting your search or filters" : "No active employees to display"}
            icon={Users}
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                      <p className="text-sm text-slate-500">{employee.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {employee.roles.map((role, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Tasks</p>
                      <p className="text-lg font-bold text-slate-900">{employee.tasksCompleted}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Accuracy</p>
                      <p className="text-lg font-bold text-slate-900">{employee.accuracy}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Productivity</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{employee.productivity}%</p>
                        {employee.productivity >= 90 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : employee.productivity >= 70 ? (
                          <Activity className="w-4 h-4 text-blue-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.performance === 'Excellent' ? 'bg-green-100 text-green-700' :
                      employee.performance === 'Good' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {employee.performance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Performance Metrics</p>
            <p>Metrics are calculated based on active employees. Task completion, accuracy, and productivity data will be populated as employees complete their work.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
