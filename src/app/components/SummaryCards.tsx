import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function SummaryCards({ totalBalance, totalIncome, totalExpenses, darkMode }: any) {
  const cards = [
    {
      title: 'Total Balance',
      amount: totalBalance,
      icon: Wallet,
      color: 'blue',
      trend: totalBalance >= 0 ? 'up' : 'down',
      trendValue: '2.5%'
    },
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: TrendingUp,
      color: 'green',
      trend: 'up',
      trendValue: '12%'
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      icon: TrendingDown,
      color: 'red',
      trend: 'down',
      trendValue: '8%'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                card.color === 'blue' ? 'bg-blue-100' :
                card.color === 'green' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  card.color === 'blue' ? 'text-blue-600' :
                  card.color === 'green' ? 'text-green-600' :
                  'text-red-600'
                }`} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                card.trend === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {card.trend === 'up' ? '↑' : '↓'} {card.trendValue}
              </div>
            </div>
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {card.title}
            </h3>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(card.amount)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
