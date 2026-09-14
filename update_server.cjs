const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  `                  {
                    name: "navigateToScreen",`,
  `                  {
                    name: "printLatestOrder",
                    description: "Prints the most recent completed order or bill for the user. Call this when the user says something like 'order ka print nikal de'.",
                    parameters: { type: "OBJECT", properties: {} },
                  },
                  {
                    name: "updateMenuItem",
                    description: "Updates an existing menu item (e.g. changing its price or name). Call this when the user says something like 'menu me iska price 50 kar do'.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        itemName: { type: "STRING", description: "The name of the menu item to update" },
                        newPrice: { type: "NUMBER", description: "The new price for the item, if requested to change." },
                        newName: { type: "STRING", description: "The new name for the item, if requested to change." }
                      },
                      required: ["itemName"],
                    },
                  },
                  {
                    name: "navigateToScreen",`
);

fs.writeFileSync('server.ts', server);
console.log('done');
