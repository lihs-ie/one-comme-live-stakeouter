export const UUIDV4String = (): string => {
  const HEX_DIGITS = '0123456789abcdef';
  const UUID_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  return UUID_TEMPLATE.replace(/[xy]/g, char => {
    const random = Math.floor(Math.random() * 16);

    if (char === 'x') {
      return HEX_DIGITS[random]!;
    } else if (char === 'y') {
      return HEX_DIGITS[(random & 0x3) | 0x8]!;
    }

    return '';
  });
};
