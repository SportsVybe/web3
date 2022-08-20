type Address = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
};

export const formatAddress = (address: Address | undefined) => {
  if (!address) return "";
  try {
    const { street, city, state, country, zip } = address;

    const newAddress = [
      capitalizeWord(street),
      capitalizeWord(city),
      state,
      country,
      zip,
    ]
      .filter(Boolean)
      .join(", ");
    return newAddress;
  } catch (error) {
    return "";
  }
};

export const capitalizeWord = (word: string | undefined) => {
  // capitalize first letter of each word
  // lowercase all other letters
  if (!word) return "";
  try {
    const newWord = word
      .split(" ")
      .map((mapWord) => {
        return mapWord.charAt(0).toUpperCase() + mapWord.slice(1).toLowerCase();
      })
      .join(" ");
    return newWord;
  } catch (error) {
    return "";
  }
};

export const capitalizeWords = (words: string | undefined) => {
  // capitalize first letter of each word
  // lowercase all other letters
  if (!words) return "";
  try {
    const newWords = words
      .split(" ")
      .map((mapWord) => {
        return mapWord.charAt(0).toUpperCase() + mapWord.slice(1).toLowerCase();
      })
      .join(" ");
    return newWords;
  } catch (error) {
    return "";
  }
};
