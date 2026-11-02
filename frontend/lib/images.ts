// Boendena har inga egna bilder i databasen. Istället väljs en exempelbild från Unsplash
// (stugor, hus, villor, lägenheter) utifrån boendets id.
const PHOTOS = [
  "1449158743715-0a90ebb6d2d8", // stuga i skogen
  "1502672260266-1c1ef2d93688", // ljus lägenhet
  "1510798831971-661eb04b3739", // stuga vid sjö i snö
  "1512917774080-9991f1c4c750", // villa med pool
  "1518780664697-55e3ad937233", // rött hus
  "1522708323590-d24dbb6b0267", // lägenhet
  "1564013799919-ab600027ffc6", // vitt hus med pool
  "1568605114967-8130f3a36994", // hus i kvällsljus
  "1570129477492-45c003edd2be", // vitt trähus
  "1580587771525-78b9dba3b914", // modern villa
];

// Samma id → alltid samma bild. Summan av tecknens koder % antal bilder ger ett index 0–9.
export function propertyImage(id: string, width = 600, height = 400): string {
  const sum = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  const photo = PHOTOS[sum % PHOTOS.length];
  return `https://images.unsplash.com/photo-${photo}?w=${width}&h=${height}&fit=crop`;
}
