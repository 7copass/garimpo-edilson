import { create } from 'zustand';
import { supabase, COMPANY_ID as DEFAULT_COMPANY_ID } from '@/lib/supabase';
import type { Tables, TablesInsert, Enums } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

// Re-export types do banco para uso nos componentes
export type TransactionType = Enums<'transaction_type'>;
export type PaymentMethod = Enums<'payment_method'>;
export type Status = Enums<'transaction_status'>;

export type Category = Tables<'categories'>;
export type CostCenter = Tables<'cost_centers'>;
export type Transaction = Tables<'transactions'>;
export type BankAccount = Tables<'bank_accounts'>;
export type Company = Tables<'companies'>;

export type DateFilterType = "today" | "last7" | "last30" | "thisMonth" | "custom" | "all";

export interface DateFilterState {
  type: DateFilterType;
  startDate: string; // ISO String
  endDate: string; // ISO String
}

interface FinancialStore {
  // Data
  categories: Category[];
  costCenters: CostCenter[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  company: Company | null;
  user: User | null;
  userRole: string | null;
  currentCompanyId: string | null;
  loading: boolean;
  error: string | null;
  dateFilter: DateFilterState;

  // Actions
  setDateFilter: (filter: DateFilterState) => void;

  // Auth actions
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Fetch actions
  fetchAll: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCostCenters: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchBankAccounts: () => Promise<void>;
  fetchCompany: () => Promise<void>;

  // Company Actions
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;

  // Category CRUD
  addCategory: (category: { name: string; type: TransactionType; isDefault?: boolean }) => Promise<void>;
  updateCategory: (id: string, data: Partial<{ name: string; type: TransactionType }>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Cost Center CRUD
  addCostCenter: (costCenter: { name: string; description?: string }) => Promise<void>;
  updateCostCenter: (id: string, data: Partial<{ name: string; description: string }>) => Promise<void>;
  deleteCostCenter: (id: string) => Promise<void>;

  // Transaction CRUD
  addTransaction: (transaction: {
    type: TransactionType;
    amount: number;
    date: string;
    description?: string;
    categoryId: string;
    costCenterId?: string;
    bankAccountId?: string;
    paymentMethod: PaymentMethod;
    status: Status;
    attachmentUrl?: string;
  }) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  markTransactionAsRealized: (id: string) => Promise<void>;
}

export const useStore = create<FinancialStore>((set, get) => ({
  categories: [],
  costCenters: [],
  transactions: [],
  bankAccounts: [],
  company: null,
  user: null,
  userRole: null,
  currentCompanyId: DEFAULT_COMPANY_ID,
  loading: false,
  error: null,
  dateFilter: {
    type: "last30",
    startDate: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString(),
    endDate: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
  },

  setDateFilter: (filter) => {
    set({ dateFilter: filter });
    get().fetchTransactions();
  },

  fetchAll: async () => {
    const { currentCompanyId } = get();
    if (!currentCompanyId) return;

    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchCompany(),
        get().fetchCategories(),
        get().fetchCostCenters(),
        get().fetchTransactions(),
        get().fetchBankAccounts(),
      ]);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, pass) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
    await get().checkAuth();
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: null, company: null, currentCompanyId: null });
    window.location.href = '/login';
  },

  checkAuth: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: member } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      set({ 
        user, 
        userRole: member?.role || null,
        currentCompanyId: member?.company_id || DEFAULT_COMPANY_ID 
      });
    } else {
      set({ user: null, userRole: null });
    }
  },

  fetchCompany: async () => {
    const companyId = get().currentCompanyId;
    if (!companyId) return;

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    set({ company: data || null });
  },

  fetchCategories: async () => {
    const companyId = get().currentCompanyId;
    if (!companyId) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name');
    if (error) throw error;
    set({ categories: data || [] });
  },

  fetchCostCenters: async () => {
    const companyId = get().currentCompanyId;
    if (!companyId) return;

    const { data, error } = await supabase
      .from('cost_centers')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    set({ costCenters: data as any || [] });
  },

  fetchTransactions: async () => {
    const companyId = get().currentCompanyId;
    if (!companyId) return;

    try {
      set({ loading: true, error: null });
      const { dateFilter } = get();

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .neq('status', 'CANCELLED')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (dateFilter.type !== "all") {
        const start = dateFilter.startDate.split('T')[0];
        const end = dateFilter.endDate.split('T')[0];
        query = query.gte('date', start).lte('date', end);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ transactions: data as Transaction[], loading: false });
    } catch (err: any) {
      console.error('Error fetching transactions:', err.message);
      set({ error: err.message, loading: false });
    }
  },

  fetchBankAccounts: async () => {
    const companyId = get().currentCompanyId;
    if (!companyId) return;

    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    set({ bankAccounts: data || [] });
  },

  updateCompany: async (id, data) => {
    const { error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', id);
    if (error) throw error;
    get().fetchCompany();
  },

  addCategory: async ({ name, type, isDefault = false }) => {
    const companyId = get().currentCompanyId;
    if (!companyId) throw new Error("Empresa não selecionada");

    const { data, error } = await supabase
      .from('categories')
      .insert({
        company_id: companyId,
        name,
        type,
        is_default: isDefault,
      })
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ categories: [...state.categories, data] }));
  },

  updateCategory: async (id, updates) => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  addCostCenter: async ({ name, description }) => {
    const companyId = get().currentCompanyId;
    if (!companyId) throw new Error("Empresa não selecionada");

    const { data, error } = await supabase
      .from('cost_centers')
      .insert({
        company_id: companyId,
        name,
        description: description || null,
      })
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ costCenters: [...state.costCenters, data] }));
  },

  updateCostCenter: async (id, updates) => {
    const { error } = await supabase
      .from('cost_centers')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      costCenters: state.costCenters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },

  deleteCostCenter: async (id) => {
    const { error } = await supabase
      .from('cost_centers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      costCenters: state.costCenters.filter((c) => c.id !== id),
    }));
  },

  addTransaction: async ({
    type,
    amount,
    date,
    description,
    categoryId,
    costCenterId,
    bankAccountId,
    paymentMethod,
    status,
    attachmentUrl,
  }) => {
    const companyId = get().currentCompanyId;
    if (!companyId) throw new Error("Empresa não selecionada");

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        company_id: companyId,
        type,
        amount,
        date,
        description: description || null,
        category_id: categoryId,
        cost_center_id: costCenterId || null,
        bank_account_id: bankAccountId || null,
        payment_method: paymentMethod,
        status,
        attachment_url: attachmentUrl || null,
        realized_at: status === 'REALIZED' ? new Date().toISOString() : null,
      })
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ transactions: [data, ...state.transactions] }));
    if (bankAccountId) {
      get().fetchBankAccounts();
    }
  },

  updateTransaction: async (id, updates) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    get().fetchBankAccounts();
  },

  markTransactionAsRealized: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'REALIZED',
        realized_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id
          ? { ...t, status: 'REALIZED' as const, realized_at: new Date().toISOString() }
          : t
      ),
    }));
    get().fetchBankAccounts();
  },
}));
