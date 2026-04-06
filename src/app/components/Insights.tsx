import { TrendingUp, PieChart, Activity } from 'lucide-react';

export default function Insights({ transactions, darkMode }: any) {
  // Calculate highest spending category
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

  const highestSpendingCategory = Object.entries(expensesByCategory)
    .sort(([, a]: any, [, b]: any) => b - a)[0] || ['N/A', 0];

  // Calculate monthly income vs expenses
  const totalIncome = transactions
    .filter((t: any) => t.type === 'Income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t: any) => t.type === 'Expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0)
  );

  const savingsRate = totalIncome > 0
    ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1)
    : 0;

  // Total transactions count
  const totalTransactions = transactions.length;

  const insights = [
    {
      icon: PieChart,
      title: 'Highest Spending',
      value: highestSpendingCategory[0],
      subtitle: `$${highestSpendingCategory[1].toLocaleString()} spent`,
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Savings Rate',
      value: `${savingsRate}%`,
      subtitle: `$${(totalIncome - totalExpenses).toLocaleString()} saved`,
      color: 'green'
    },
    {
      icon: Activity,
      title: 'Total Transactions',
      value: totalTransactions,
      subtitle: 'This period',
      color: 'blue'
    }
  ];

  return (
    <div className="mb-8" id="insights">
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Key Financial Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  insight.color === 'purple' ? 'bg-purple-100' :
                  insight.color === 'green' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    insight.color === 'purple' ? 'text-purple-600' :
                    insight.color === 'green' ? 'text-green-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    {insight.title}
                  </p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {insight.value}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {insight.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
