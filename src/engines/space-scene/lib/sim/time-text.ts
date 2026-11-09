import { plainText, speakable } from '../../../../lib/rich-text';

const words = { plainText, speakable };
export const loadTimeText = async (): Promise<void> => {};
export const readTimeText = () => words;
