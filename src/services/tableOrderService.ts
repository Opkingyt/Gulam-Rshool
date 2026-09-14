import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, updateDoc, doc, deleteDoc, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { TableOrder, TableOrderStatus, MenuItem } from '../types';

class TableOrderService {
  private collectionName = 'orders';
  private hotelDataCol = 'hotel_data';
  private menuDocId = 'shared_menu';

  // --- Orders ---
  async submitOrder(orderData: Omit<TableOrder, 'id'>) {
    try {
      const ordersRef = collection(db, this.collectionName);
      const docRef = await addDoc(ordersRef, orderData);
      return docRef.id;
    } catch (e) {
      console.error("Error submitting table order", e);
      throw e;
    }
  }

  subscribeToOrders(onUpdate: (orders: TableOrder[]) => void) {
    const ordersRef = collection(db, this.collectionName);
    const q = query(ordersRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: TableOrder[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as TableOrder);
      });
      onUpdate(orders);
    }, (error) => {
      console.error("Firestore Error in subscribeToOrders: ", error);
    });

    return unsubscribe;
  }

  async updateStatus(orderId: string, status: TableOrderStatus) {
    try {
      const orderRef = doc(db, this.collectionName, orderId);
      await updateDoc(orderRef, { status });
    } catch (e) {
      console.error("Error updating order status", e);
    }
  }

  async deleteOrder(orderId: string) {
    try {
      const orderRef = doc(db, this.collectionName, orderId);
      await deleteDoc(orderRef);
    } catch (e) {
      console.error("Error deleting order", e);
    }
  }

  // --- Shared Menu Syncing ---
  async syncMenuToCloud(menu: MenuItem[]) {
    try {
      const menuRef = doc(db, this.hotelDataCol, this.menuDocId);
      await setDoc(menuRef, { menu, updatedAt: Date.now() });
    } catch (e) {
      console.error("Error syncing menu to cloud", e);
    }
  }

  async getMenuFromCloud(): Promise<MenuItem[] | null> {
    try {
      const menuRef = doc(db, this.hotelDataCol, this.menuDocId);
      const docSnap = await getDoc(menuRef);
      if (docSnap.exists() && docSnap.data().menu) {
        return docSnap.data().menu as MenuItem[];
      }
    } catch (e) {
      console.error("Error fetching menu from cloud", e);
    }
    return null;
  }
}

export const tableOrderService = new TableOrderService();
