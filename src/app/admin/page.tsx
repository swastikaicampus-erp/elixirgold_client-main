'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import CityManagement from './components/CityManagement';
import CarouselManagement from './components/CarouselManagement';
import UserManagement from './components/UserManagement';
import ChangePassword from './components/ChangePassword';
import CommodityMappingManagement from './components/CommodityMappingManagement';
import MetalsManagement from './components/MetalsManagement';

type Tab = 'cities' | 'carousel' | 'metals' | 'commodityMapping' | 'users' | 'password';

export default function AdminPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('cities');
  const isSuperadmin = role === 'superadmin';

  return (
    <>

      <div className="flex flex-col flex-1 items-start justify-start bg-zinc-50 font-sans dark:bg-black min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8 w-full space-y-6 md:space-y-8">


        {/* Tab Navigation */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar pb-px">
          <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('cities')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'cities'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              Cities
            </button>
            <button
              onClick={() => setActiveTab('carousel')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'carousel'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              Carousel Images
            </button>
            <button
              onClick={() => setActiveTab('metals')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'metals'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              Metals
            </button>
            {isSuperadmin && (
              <button
                onClick={() => setActiveTab('commodityMapping')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'commodityMapping'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700'
                  }
                `}
              >
                Commodity Mapping
              </button>
            )}
            {isSuperadmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700'
                  }
                `}
              >
                User Management
              </button>
            )}
            <button
              onClick={() => setActiveTab('password')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'password'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              Change Password
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === 'cities' && <CityManagement />}
          {activeTab === 'carousel' && <CarouselManagement />}
          {activeTab === 'metals' && <MetalsManagement />}
          {activeTab === 'commodityMapping' && isSuperadmin && <CommodityMappingManagement />}
          {activeTab === 'users' && isSuperadmin && <UserManagement />}
          {activeTab === 'password' && <ChangePassword />}
        </div>
      </div>
    </div>
    </>
  );
}
