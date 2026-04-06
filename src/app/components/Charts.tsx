import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Charts({ transactions, darkMode }: any) {
  // Prepare balance trend data - aggregate by unique dates
  const sortedTransactions = [...transactions].sort((a: any, b: any) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group transactions by date and calculate daily balance
  const balanceByDate: any = {};
  let runningBalance = 0;

  sortedTransactions.forEach((transaction: any) => {
    const dateKey = transaction.date;
    const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!balanceByDate[dateKey]) {
      balanceByDate[dateKey] = {
        date: formattedDate,
        dateKey: dateKey,
        balance: runningBalance,
        transactions: []
      };
    }

    runningBalance += transaction.amount;
    balanceByDate[dateKey].balance = runningBalance;
  });

  const balanceTrend = Object.values(balanceByDate);

  // Prepare spending by category data
  const expensesByCategory = transactions
    .filter((t: any) => t.type === 'Expense')
    .reduce((acc: any, transaction: any) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(transaction.amount);
      return acc;
    }, {});

  const categoryData = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    id: name,
    colorIndex: index
  }));

  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1'];

  // Check if there's data to display
  const hasBalanceData = balanceTrend.length > 0;
  const hasCategoryData = categoryData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 rounded-lg shadow-lg border`}>
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {payload[0].name}: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Line Chart - Balance Trend */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Balance Trend
        </h3>
        {hasBalanceData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis
                dataKey="date"
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={darkMode ? '#9CA3AF' : '#6B7280'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">📊</div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No transaction data yet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pie Chart - Spending by Category */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Spending by Category
        </h3>
        {hasCategoryData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry) => (
                  <Cell key={entry.id} fill={COLORS[entry.colorIndex % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">📈</div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No expense data yet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
