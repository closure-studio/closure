import {
  bundledCharacterTable,
  bundledItemTable,
  bundledStageTable,
  getCharacterDisplayName,
  getStageDisplayLabel,
} from './game-data';

function requireFirstEntry<T>(table: Readonly<Record<string, T>>, tableName: string) {
  const entry = Object.entries(table)[0];
  if (!entry) throw new Error(`Expected the bundled ${tableName} to contain at least one entry.`);
  return entry;
}

function createMissingId(table: Readonly<Record<string, unknown>>, prefix: string) {
  let candidate = prefix;
  while (table[candidate] !== undefined) candidate = `${candidate}_missing`;
  return candidate;
}

describe('bundled game resource catalog', () => {
  it.each([
    ['Item Table', bundledItemTable],
    ['Stage Table', bundledStageTable],
    ['Character Table', bundledCharacterTable],
  ])('loads a non-empty %s that satisfies its owning schema', (_tableName, table) => {
    expect(Object.keys(table).length).toBeGreaterThan(0);
  });

  it('resolves metadata from whichever entries are currently bundled', () => {
    const [characterId, character] = requireFirstEntry(bundledCharacterTable, 'Character Table');
    const [stageId, stage] = requireFirstEntry(bundledStageTable, 'Stage Table');

    expect(getCharacterDisplayName(bundledCharacterTable, characterId)).toBe(character.name);
    expect(getStageDisplayLabel(bundledStageTable, stageId, '—')).toBe(`${stage.code} · ${stage.name}`);
  });

  it('preserves identifiers that are absent from the current resource catalog', () => {
    const missingCharacterId = createMissingId(bundledCharacterTable, 'test_missing_character');
    const missingStageId = createMissingId(bundledStageTable, 'test_missing_stage');

    expect(getCharacterDisplayName(bundledCharacterTable, missingCharacterId)).toBe(missingCharacterId);
    expect(getStageDisplayLabel(bundledStageTable, missingStageId, '—')).toBe(missingStageId);
    expect(getStageDisplayLabel(bundledStageTable, '', '—')).toBe('—');
  });
});
