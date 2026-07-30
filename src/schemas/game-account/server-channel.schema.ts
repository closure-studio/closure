import * as v from 'valibot';

export const serverChannelSchema = v.picklist(['官服', 'B服']);

export type ServerChannel = v.InferOutput<typeof serverChannelSchema>;
