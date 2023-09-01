const fs = require('fs');
const path = require('path');

// Define a mapping for rarity replacements
const rarityMapping = {
  'Common': 'basic',
  'Rare': 'silver',
  'Super Rare': 'gold',
  'Ultra Rare': 'alternative_art',
};

const directoryPath = './card_images';

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(filename => {
    const filePath = path.join(directoryPath, filename);
    const fileInfo = path.parse(filename);
    const originalName = fileInfo.name;

    const regex = /^\d+\.\s*(.*?)\s*\((.*?)\)\s*$/;
    const matches = originalName.match(regex);

    if (matches) {
      const [, namePart, rarityPart] = matches;
      const namePartModified = namePart.toLowerCase().replace(/\s+/g, '_');
      const rarityReplaced = rarityMapping[rarityPart] || rarityPart;
      const newName = `${namePartModified}@${rarityReplaced}${fileInfo.ext}`;
      const newPath = path.join(directoryPath, newName);

      fs.rename(filePath, newPath, err => {
        if (err) {
          console.error(`Error renaming ${filename}:`, err);
        } else {
          console.log(`Renamed ${filename} -> ${newName}`);
        }
      });
    }
  });
});
