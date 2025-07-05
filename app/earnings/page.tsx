
'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Download,
  PlusCircle,
  BarChart2,
  Calendar,
  Gift
} from 'lucide-react';

import { earningsData, goals, recentTransactions, type RevenueData } from '@/config/earningsData';
import { useUser } from '@/contexts/UserContext';

const chartConfig = {
  sales: { label: 'Sales', color: 'hsl(var(--primary))' },
  subscriptions: { label: 'Subscriptions', color: 'hsl(var(--accent))' },
  tips: { label: 'Tips', color: 'hsl(var(--secondary))' },
};


function StatCard({ title, value, icon, prefix = '', suffix = '', details, colorClass = 'text-primary' }: { title: string; value: number; icon: React.ReactNode; prefix?: string; suffix?: string; details: string; colorClass?: string; }) {
  return (
    <Card className="shadow-lg transition-transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {React.cloneElement(icon as React.ReactElement, { className: `h-4 w-4 text-muted-foreground` })}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>
          <CountUp start={0} end={value} duration={2.5} separator="," prefix={prefix} suffix={suffix} decimals={prefix === '$' ? 2 : 0} />
        </div>
        <p className="text-xs text-muted-foreground">{details}</p>
      </CardContent>
    </Card>
  );
}

export default function EarningsDashboardPage() {
  const [timeframe, setTimeframe] = React.useState('30d');
  const { userProfile } = useUser();
  
  return (
      <PageWrapper className="py-8 bg-muted/20">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-headline text-foreground">Earnings Dashboard</h1>
          <p className="text-lg text-muted-foreground">Track your monetization and growth on YourSpace.</p>
        </header>

        {/* Stat Cards Section */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Revenue (30 Days)" value={3459.75} prefix="$" icon={<DollarSign />} details="+20.1% from last month (mock)" colorClass="text-primary" />
          <StatCard title="Total Followers" value={userProfile?.stats.followers || 0} icon={<Users />} details="Represents subscribers" colorClass="text-accent" />
          <StatCard title="Item Sales (mock)" value={89} icon={<ShoppingBag />} details="2 Best-sellers" colorClass="text-foreground"/>
          <StatCard title="Tips Received (mock)" value={284.50} prefix="$" icon={<Gift />} details="Last tip 2 hours ago" colorClass="text-green-500" />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Chart & Transactions */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-foreground flex items-center"><BarChart2 className="mr-2"/>Revenue Streams</CardTitle>
                  <CardDescription className="text-muted-foreground">Overview of your earnings in the selected timeframe.</CardDescription>
                </div>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[180px] mt-2 sm:mt-0">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer>
                    <AreaChart data={earningsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSubscriptions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-subscriptions)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-subscriptions)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`}/>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Area type="monotone" dataKey="sales" stroke={chartConfig.sales.color} fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} style={{'--color-sales': chartConfig.sales.color} as React.CSSProperties}/>
                      <Area type="monotone" dataKey="subscriptions" stroke={chartConfig.subscriptions.color} fillOpacity={1} fill="url(#colorSubscriptions)" strokeWidth={2} style={{'--color-subscriptions': chartConfig.subscriptions.color} as React.CSSProperties}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity (mock)</CardTitle>
                <CardDescription className="text-muted-foreground">Latest sales, subscriptions, and tips.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Item/User</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Badge variant={t.type === 'Sale' ? 'default' : t.type === 'Subscription' ? 'secondary' : 'outline'} className={
                            t.type === 'Sale' ? 'bg-primary/90 text-primary-foreground' : 
                            t.type === 'Subscription' ? 'bg-accent/90 text-accent-foreground' :
                            'border-green-500/50 text-green-500'
                          }>{t.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{t.description}</TableCell>
                        <TableCell className="text-right font-medium text-green-500">+${t.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Goals & Payouts */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center"><TrendingUp className="mr-2"/>Earning Goals</CardTitle>
                <CardDescription className="text-muted-foreground">Track your progress towards your creative goals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-foreground">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">
                        <CountUp end={goal.current} prefix="$" separator=","/> / <CountUp end={goal.target} prefix="$" separator=","/>
                      </span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" indicatorClassName="bg-gradient-to-r from-accent to-primary"/>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">
                   <PlusCircle className="mr-2 h-4 w-4"/> Set New Goal
                 </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-lg">
               <CardHeader>
                <CardTitle className="text-foreground flex items-center"><Calendar className="mr-2"/>Payouts</CardTitle>
                <CardDescription className="text-muted-foreground">Your payout schedule and history.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                 <p className="text-sm text-muted-foreground">Next Payout</p>
                 <p className="text-3xl font-bold text-primary my-2">$<CountUp end={1240.50} duration={2} decimals={2} separator=","/></p>
                 <p className="text-sm text-muted-foreground">Scheduled for July 15, 2025</p>
              </CardContent>
               <CardFooter className="flex-col gap-2">
                 <Button className="w-full">View Payout History</Button>
                 <Button variant="link" className="text-primary">Manage Payout Settings</Button>
              </CardFooter>
            </Card>

             <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" className="w-full">
                      <Download className="mr-2 h-4 w-4"/> Export Full Earnings Report
                    </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </PageWrapper>
  );
}
