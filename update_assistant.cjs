const fs = require('fs');

let content = fs.readFileSync('src/components/AIAssistantScreen.tsx', 'utf8');

content = content.replace(
  `  onNavigate?: (tab: any) => void;
}`,
  `  onNavigate?: (tab: any) => void;
  onPrintLatestOrder?: () => void;
  onUpdateMenuItem?: (itemName: string, newPrice?: number, newName?: string) => void;
}`
);

content = content.replace(
  `  isBluetoothConnected,
  onNavigate
}) => {`,
  `  isBluetoothConnected,
  onNavigate,
  onPrintLatestOrder,
  onUpdateMenuItem
}) => {`
);

content = content.replace(
  `        if (data.action.name === 'navigateToScreen' && onNavigate) {
          onNavigate(data.action.args.screenName);
        }`,
  `        if (data.action.name === 'navigateToScreen' && onNavigate) {
          onNavigate(data.action.args.screenName);
        } else if (data.action.name === 'printLatestOrder' && onPrintLatestOrder) {
          onPrintLatestOrder();
        } else if (data.action.name === 'updateMenuItem' && onUpdateMenuItem) {
          onUpdateMenuItem(data.action.args.itemName, data.action.args.newPrice, data.action.args.newName);
        }`
);

fs.writeFileSync('src/components/AIAssistantScreen.tsx', content);
console.log('done');
