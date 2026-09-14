const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const handlers = `  const handleQuickPrintBill = async (bill: Bill) => {
    if (isBluetoothConnected) {
      playSfx('beep');
      const res = await bluetoothPrinterService.printBill(bill, settings);
      if (res.success) {
        playSfx('success');
      } else {
        setActiveReceiptBill(bill);
        setIsReceiptModalOpen(true);
      }
    } else {
      setActiveReceiptBill(bill);
      setIsReceiptModalOpen(true);
    }
  };

  const handleAIPrintLatestOrder = () => {
    if (bills.length > 0) {
      const sortedBills = [...bills].sort((a, b) => b.timestamp - a.timestamp);
      const latestBill = sortedBills[0];
      handleQuickPrintBill(latestBill);
    }
  };

  const handleAIUpdateMenuItem = (itemName: string, newPrice?: number, newName?: string) => {
    const itemIndex = menu.findIndex(i => 
      i.name.toLowerCase().includes(itemName.toLowerCase()) || 
      (i.englishName && i.englishName.toLowerCase().includes(itemName.toLowerCase())) ||
      (i.hindiName && i.hindiName.toLowerCase().includes(itemName.toLowerCase()))
    );

    if (itemIndex !== -1) {
      const updatedMenu = [...menu];
      const currentItem = updatedMenu[itemIndex];
      const updatedItem = { ...currentItem };
      
      if (newPrice !== undefined) updatedItem.price = newPrice;
      if (newName !== undefined) {
        updatedItem.name = newName;
      }
      
      updatedMenu[itemIndex] = updatedItem;
      setMenu(updatedMenu);
      storageService.saveMenu(updatedMenu);
      playSfx('success');
    }
  };`;

app = app.replace(/  const handleQuickPrintBill = async \(bill: Bill\) => \{[\s\S]*?  \};\n/m, handlers + '\n');

app = app.replace(
  `          <AIAssistantScreen
            menu={menu}
            bills={bills}
            settings={settings}
            tableOrders={tableOrders}
            isBluetoothConnected={isBluetoothConnected}
            onNavigate={setActiveTab}
          />`,
  `          <AIAssistantScreen
            menu={menu}
            bills={bills}
            settings={settings}
            tableOrders={tableOrders}
            isBluetoothConnected={isBluetoothConnected}
            onNavigate={setActiveTab}
            onPrintLatestOrder={handleAIPrintLatestOrder}
            onUpdateMenuItem={handleAIUpdateMenuItem}
          />`
);

fs.writeFileSync('src/App.tsx', app);
console.log('done');
