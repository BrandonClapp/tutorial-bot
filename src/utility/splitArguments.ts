// TODO: Add Jest to unit test this with

import { isEmptyOrSpaces } from "./isEmptyOrSpaces";

// !giveaway create 60 "Free Steam Key" :mage: 2'
// ['!giveaway', 'create', '60', 'Free Steam Key', ':mage:', '2']
export function splitArguments(command: string): string[] {
  const allWords = command.split(" ");
  let args = [];
  for (let i = 0; i < allWords.length; i++) {
    let inQuotes = false;
    if (allWords[i].startsWith('"')) {
      inQuotes = true;
    }
    if (allWords[i].endsWith('"')) {
      inQuotes = false;
    }

    if (inQuotes) {
      let endingIndex = 0;
      let quoteParts = [];
      for (let j = i; j < allWords.length; j++) {
        quoteParts.push(allWords[j]);
        if (allWords[j].endsWith('"')) {
          endingIndex = j;
          break;
        }
      }
      inQuotes = false;
      i = endingIndex;
      args.push(quoteParts.join(" ").replace(/\"/g, ""));
    } else {
      if (!isEmptyOrSpaces(allWords[i])) {
        args.push(allWords[i]);
      }
    }
  }
  return args;
}

//   const args = split('!giveaway create 60 "Free Steam Key" 👍 2');
//   console.log("args", args);

// split('!giveaway create 60 "Free Steam Key" :mage: 2');
// split('!giveaway create 60 "Free Steam Key" 👍 2');
