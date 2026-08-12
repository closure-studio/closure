import { parse } from 'valibot';

import rawItemTable from '@/assets/data/item_table.json';
import { itemTableSchema } from '@/schemas/game-data';

export const itemTable = parse(itemTableSchema, rawItemTable);
