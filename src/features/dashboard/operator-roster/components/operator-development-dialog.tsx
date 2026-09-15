import { Minus, Plus, Trash2, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  ScrollView,
  Spinner,
  VisuallyHidden,
  XStack,
  YStack,
  getTokens,
  styled,
  useMedia,
} from "tamagui";

import { AdaptiveDialog, TerminalText } from "@/components";
import type { CharacterTableEntry } from "@/schemas/game-data";
import {
  OPERATOR_DEVELOPMENT_PHASES,
  OPERATOR_MASTERY_LEVELS,
  canDevelopMasteries,
  createDefaultDevelopmentTarget,
  getDevelopmentLevelRange,
  getDevelopmentSkillLevelMax,
  getMaxDevelopmentPhase,
  stepDevelopmentSkillLevel,
  validateOperatorDevelopmentTarget,
  type OperatorDevelopmentCharacter,
  type OperatorDevelopmentPhase,
  type OperatorDevelopmentTarget,
  type OperatorDevelopmentTask,
} from "@/utils/operator-development/operator-development";

type OperatorDevelopmentDialogProps = {
  hasError: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (target: OperatorDevelopmentTarget | null) => void;
  selection: OperatorDevelopmentSelection | null;
};

type OperatorDevelopmentSelection = {
  name: string;
  operator: OperatorDevelopmentCharacter;
  rarity: CharacterTableEntry["rarity"] | null;
  task: OperatorDevelopmentTask | null;
};

type OperatorDevelopmentEditorProps = OperatorDevelopmentSelection &
  Pick<
    OperatorDevelopmentDialogProps,
    "hasError" | "isSubmitting" | "onSubmit"
  > & {
    onOpenChange: (open: boolean) => void;
  };

type NumericTargetKey = "level" | "skill_level";
type StepDirection = -1 | 1;

const ROMAN_MASTERY_LEVELS = ["", "I", "II", "III"] as const;

const Hint = styled(TerminalText, {
  size: "$2",
  color: "$appMuted",
  $large: { size: "$2.5" },
});
const Section = styled(YStack, {
  gap: "$3",
  p: "$3",
  bg: "$appSurfaceRaised",
  rounded: "$2",
});
const Choice = styled(Button, {
  unstyled: true,
  flexBasis: 0,
  grow: 1,
  minW: 0,
  minH: 44,
  px: "$1.5",
  py: "$2",
  items: "center",
  justify: "center",
  rounded: "$2",
  borderWidth: 1,
  borderColor: "$appBorder",
  hoverStyle: { bg: "$appAccentSoft" },
  pressStyle: { opacity: 0.7 },
  variants: {
    selected: {
      true: { bg: "$appAccentSoft", borderColor: "$appAccent" },
      false: { bg: "transparent" },
    },
    unavailable: { true: { opacity: 0.4 }, false: { opacity: 1 } },
  } as const,
});

function NumericStepper({
  decreaseLabel,
  disabled,
  increaseLabel,
  max,
  min,
  onStep,
  testID,
  value,
}: {
  decreaseLabel: string;
  disabled: boolean;
  increaseLabel: string;
  max: number;
  min: number;
  onStep: (direction: StepDirection) => void;
  testID: string;
  value: number;
}) {
  const colors = getTokens().color;
  return (
    <XStack width={156} items="center" gap="$1.5">
      <Choice
        testID={`${testID}-decrease`}
        aria-label={decreaseLabel}
        grow={0}
        flexBasis={44}
        disabled={disabled || value <= min}
        unavailable={disabled || value <= min}
        onPress={() => onStep(-1)}
      >
        <Minus size={18} color={colors.appAccent.val} />
      </Choice>
      <TerminalText
        testID={testID}
        grow={1}
        text="center"
        size="$4"
        fontWeight="700"
        fontVariant={["tabular-nums"]}
      >
        {value}
      </TerminalText>
      <Choice
        testID={`${testID}-increase`}
        aria-label={increaseLabel}
        grow={0}
        flexBasis={44}
        disabled={disabled || value >= max}
        unavailable={disabled || value >= max}
        onPress={() => onStep(1)}
      >
        <Plus size={18} color={colors.appAccent.val} />
      </Choice>
    </XStack>
  );
}

function OperatorDevelopmentEditor({
  hasError,
  isSubmitting,
  name,
  onSubmit,
  onOpenChange,
  operator,
  rarity,
  task,
}: OperatorDevelopmentEditorProps) {
  const { t } = useTranslation("dashboard");
  const colors = getTokens().color;
  const { large } = useMedia();
  const Content = large ? ScrollView : YStack;
  const isAdded = task !== null;
  const [draft, setDraft] = useState<OperatorDevelopmentTarget | null>(() =>
    task !== null || rarity === null
      ? null
      : createDefaultDevelopmentTarget(operator, rarity),
  );
  const target = task?.target ?? draft;
  const locked = isAdded || isSubmitting || draft === null || rarity === null;
  const skills = useMemo(
    () => [
      ...new Map(
        operator.skills.map((skill) => [skill.skillId, skill]),
      ).values(),
    ],
    [operator.skills],
  );

  const setPhase = (phase: OperatorDevelopmentPhase) => {
    if (locked || rarity === null) return;
    setDraft((current) => {
      if (current === null) return current;
      const range = getDevelopmentLevelRange(operator, rarity, phase);
      if (range === null) return current;
      const skillLevelMax = getDevelopmentSkillLevelMax(operator, phase);
      const skillLevel =
        current.skill_level > skillLevelMax
          ? skillLevelMax
          : current.skill_level;
      const next: OperatorDevelopmentTarget = {
        ...current,
        evolve_phase: phase,
        level: Math.max(range.min, Math.min(range.max, current.level)),
        skill_level: skillLevel,
      };
      return canDevelopMasteries(operator, rarity, next)
        ? next
        : { ...next, masteries: [] };
    });
  };

  const stepNumber = (key: NumericTargetKey, direction: StepDirection) => {
    if (locked || rarity === null) return;
    setDraft((current) => {
      if (current === null) return current;
      if (key === "level") {
        const range = getDevelopmentLevelRange(
          operator,
          rarity,
          current.evolve_phase,
        );
        if (range === null) return current;
        const level = Math.max(
          range.min,
          Math.min(range.max, current.level + direction),
        );
        return level === current.level ? current : { ...current, level };
      }

      const skillLevel = stepDevelopmentSkillLevel(
        current.skill_level,
        direction,
        getDevelopmentSkillLevelMax(operator, current.evolve_phase),
      );
      if (skillLevel === current.skill_level) return current;
      const next = { ...current, skill_level: skillLevel };
      return canDevelopMasteries(operator, rarity, next)
        ? next
        : { ...next, masteries: [] };
    });
  };

  const setMastery = (skillId: string, level: 0 | 1 | 2 | 3) => {
    if (locked || rarity === null || target === null) return;
    if (level > 0 && !canDevelopMasteries(operator, rarity, target)) return;
    setDraft((current) => {
      if (current === null) return current;
      const masteries = current.masteries.filter(
        (mastery) => mastery.skill_id !== skillId,
      );
      if (level === 0) return { ...current, masteries };
      return {
        ...current,
        masteries: [...masteries, { skill_id: skillId, target_level: level }],
      };
    });
  };

  const phaseMax =
    rarity === null ? operator.evolvePhase : getMaxDevelopmentPhase(rarity);
  const levelRange =
    target && rarity !== null
      ? getDevelopmentLevelRange(operator, rarity, target.evolve_phase)
      : null;
  const skillLevelMax = target
    ? getDevelopmentSkillLevelMax(operator, target.evolve_phase)
    : 1;

  const masteryAvailable =
    target !== null &&
    rarity !== null &&
    canDevelopMasteries(operator, rarity, target);
  const submitDisabled =
    isSubmitting ||
    (!isAdded &&
      (draft === null ||
        rarity === null ||
        !validateOperatorDevelopmentTarget(operator, rarity, draft)));

  return (
    <Content $large={{ maxH: "75vh" }}>
      <YStack gap="$3">
        <XStack
          pt="$2"
          gap="$3"
          items="flex-start"
          $large={{ pt: "$0", pr: "$6" }}
        >
          <YStack flex={1} minW={0} gap="$2">
            <Dialog.Title asChild>
              <TerminalText size="$5" fontWeight="700">
                {t("operators.development.title", { name })}
              </TerminalText>
            </Dialog.Title>
            <VisuallyHidden>
              <Dialog.Description>
                {t("operators.development.description")}
              </Dialog.Description>
            </VisuallyHidden>
          </YStack>
          <Button
            unstyled
            minH={44}
            width={44}
            items="center"
            justify="center"
            testID="operator-development-close"
            $large={{ display: "none" }}
            aria-label={t("operators.closeDetails")}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.45 : 1}
            onPress={() => onOpenChange(false)}
            hoverStyle={{ bg: "$appSurfaceRaised" }}
            pressStyle={{ opacity: 0.7 }}
          >
            <X size={22} color={colors.appText.val} />
          </Button>
        </XStack>

        <YStack gap="$3">
          {target ? (
            <>
              <Section>
                <YStack gap="$1.5">
                  <XStack gap="$2">
                    {OPERATOR_DEVELOPMENT_PHASES.map((phase) => {
                      const selected = target.evolve_phase === phase;
                      const unavailable =
                        phase < operator.evolvePhase || phase > phaseMax;
                      return (
                        <Choice
                          key={phase}
                          selected={selected}
                          unavailable={unavailable && !selected}
                          testID={`operator-development-phase-${phase}`}
                          aria-pressed={selected}
                          disabled={locked || unavailable}
                          onPress={() => setPhase(phase)}
                        >
                          <TerminalText
                            size="$2.5"
                            text="center"
                            color={selected ? "$appAccent" : "$appText"}
                          >
                            {t("operators.development.phaseValue", { phase })}
                          </TerminalText>
                        </Choice>
                      );
                    })}
                  </XStack>
                  {operator.evolvePhase > 0 || phaseMax < 2 ? (
                    <XStack gap="$2" flexWrap="wrap">
                      {operator.evolvePhase > 0 ? (
                        <Hint>{t("operators.development.noDowngrade")}</Hint>
                      ) : null}
                      {phaseMax < 2 ? (
                        <Hint>
                          {t("operators.development.phaseLimit", {
                            phase: phaseMax,
                          })}
                        </Hint>
                      ) : null}
                    </XStack>
                  ) : null}
                </YStack>

                <XStack
                  minH={52}
                  pt="$2"
                  items="center"
                  justify="space-between"
                  gap="$2"
                  borderTopWidth={1}
                  borderColor="$appRule"
                >
                  <YStack grow={1} minW={0} gap="$0.5">
                    <Hint>{t("operators.development.level")}</Hint>
                    {levelRange ? (
                      <XStack items="center" gap="$1.5" flexWrap="wrap">
                        <Hint>
                          {t("operators.development.levelRange", levelRange)}
                        </Hint>
                        {levelRange.min === levelRange.max ? (
                          <Hint>{t("operators.development.atMax")}</Hint>
                        ) : !isAdded ? (
                          <Button
                            unstyled
                            minH={32}
                            px="$1"
                            justify="center"
                            disabled={locked || target.level === levelRange.max}
                            testID="operator-development-max-level"
                            onPress={() =>
                              setDraft((current) =>
                                current === null
                                  ? current
                                  : { ...current, level: levelRange.max },
                              )
                            }
                          >
                            <TerminalText
                              size="$2"
                              color={
                                target.level === levelRange.max
                                  ? "$appMuted"
                                  : "$appAccent"
                              }
                            >
                              {t("operators.development.maxLevel")}
                            </TerminalText>
                          </Button>
                        ) : null}
                      </XStack>
                    ) : null}
                  </YStack>
                  <NumericStepper
                    testID="operator-development-level"
                    value={target.level}
                    min={levelRange?.min ?? target.level}
                    max={levelRange?.max ?? target.level}
                    disabled={locked || levelRange === null}
                    decreaseLabel={t("operators.development.decreaseLevel")}
                    increaseLabel={t("operators.development.increaseLevel")}
                    onStep={(direction) => stepNumber("level", direction)}
                  />
                </XStack>

                <XStack
                  minH={52}
                  pt="$2"
                  items="center"
                  justify="space-between"
                  gap="$2"
                  borderTopWidth={1}
                  borderColor="$appRule"
                >
                  <YStack grow={1} minW={0} gap="$0.5">
                    <Hint>{t("operators.development.skillLevel")}</Hint>
                    <Hint>{t("operators.development.unknownSkillLevel")}</Hint>
                  </YStack>
                  <NumericStepper
                    testID="operator-development-skill-level"
                    value={target.skill_level}
                    min={1}
                    max={skillLevelMax}
                    disabled={locked || skillLevelMax === 1}
                    decreaseLabel={t(
                      "operators.development.decreaseSkillLevel",
                    )}
                    increaseLabel={t(
                      "operators.development.increaseSkillLevel",
                    )}
                    onStep={(direction) => stepNumber("skill_level", direction)}
                  />
                </XStack>
              </Section>

              <Section>
                {skills.length === 0 ? (
                  <Hint>{t("operators.development.noSkills")}</Hint>
                ) : (
                  <>
                    {!masteryAvailable ? (
                      <Hint>
                        {t(
                          phaseMax < 2
                            ? "operators.development.masteryUnsupported"
                            : "operators.development.masteryRequirement",
                        )}
                      </Hint>
                    ) : null}
                    {skills.map((skill, index) => {
                      const selectedMastery =
                        target.masteries.find(
                          (entry) => entry.skill_id === skill.skillId,
                        )?.target_level ?? 0;
                      return (
                        <YStack key={skill.skillId} gap="$1.5">
                          <XStack
                            items="center"
                            justify="space-between"
                            gap="$2"
                            flexWrap="wrap"
                          >
                            <TerminalText size="$3" fontWeight="600">
                              {t("operators.development.skill", {
                                index: index + 1,
                              })}
                            </TerminalText>
                            <Hint>
                              {t("operators.development.currentMastery", {
                                level:
                                  skill.specializeLevel === 0
                                    ? t("operators.development.untrained")
                                    : ROMAN_MASTERY_LEVELS[
                                        skill.specializeLevel
                                      ],
                              })}
                            </Hint>
                          </XStack>
                          <XStack gap="$1.5">
                            {OPERATOR_MASTERY_LEVELS.map((level) => {
                              const selected = selectedMastery === level;
                              const unavailable =
                                level > 0 &&
                                (!masteryAvailable ||
                                  level < skill.specializeLevel);
                              return (
                                <Choice
                                  key={level}
                                  selected={selected}
                                  unavailable={unavailable && !selected}
                                  testID={`operator-development-mastery-${index}-${level}`}
                                  aria-pressed={selected}
                                  disabled={locked || unavailable}
                                  onPress={() =>
                                    setMastery(skill.skillId, level)
                                  }
                                >
                                  <TerminalText
                                    size="$2.5"
                                    text="center"
                                    color={selected ? "$appAccent" : "$appText"}
                                  >
                                    {level === 0
                                      ? t("operators.development.noMastery")
                                      : t(
                                          "operators.development.masteryValue",
                                          {
                                            level: ROMAN_MASTERY_LEVELS[level],
                                          },
                                        )}
                                  </TerminalText>
                                </Choice>
                              );
                            })}
                          </XStack>
                          {skill.specializeLevel > 0 ? (
                            <Hint>
                              {t("operators.development.masteryNoDowngrade")}
                            </Hint>
                          ) : null}
                        </YStack>
                      );
                    })}
                  </>
                )}
              </Section>
            </>
          ) : (
            <TerminalText color="$appDanger">
              {t("operators.development.missingRarity")}
            </TerminalText>
          )}
        </YStack>

        <YStack
          testID="operator-development-actions"
          pt="$2"
          gap="$2"
          shrink={0}
          borderTopWidth={1}
          borderColor="$appRule"
          bg="$appSurfaceStrong"
        >
          {hasError ? (
            <TerminalText role="alert" size="$2.5" color="$appDanger">
              {t("operators.development.saveFailed")}
            </TerminalText>
          ) : null}
          <Button
            testID="operator-development-submit"
            unstyled
            minH={48}
            p="$3"
            rounded="$3"
            aria-label={t(
              isAdded
                ? "operators.development.remove"
                : "operators.development.add",
            )}
            items="center"
            justify="center"
            borderWidth={1}
            borderColor={isAdded ? "$appDangerBorder" : "$appAccent"}
            bg={isAdded ? "$appDangerSoft" : "$appAccent"}
            disabled={submitDisabled}
            opacity={submitDisabled ? 0.45 : 1}
            hoverStyle={{ opacity: 0.84 }}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onSubmit(isAdded ? null : draft)}
          >
            <XStack items="center" justify="center" gap="$2" maxW="100%">
              {isSubmitting ? (
                <Spinner
                  size="small"
                  color={isAdded ? "$appDanger" : "$appBackground"}
                />
              ) : isAdded ? (
                <Trash2 size={18} color={colors.appDanger.val} />
              ) : (
                <Plus size={18} color={colors.appBackground.val} />
              )}
              <TerminalText
                size="$3"
                fontWeight="700"
                shrink={1}
                text="center"
                color={isAdded ? "$appDanger" : "$appBackground"}
              >
                {t(
                  isSubmitting
                    ? "operators.development.saving"
                    : isAdded
                      ? "operators.development.remove"
                      : "operators.development.add",
                )}
              </TerminalText>
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </Content>
  );
}

export function OperatorDevelopmentDialog({
  hasError,
  isSubmitting,
  onOpenChange,
  onSubmit,
  selection,
}: OperatorDevelopmentDialogProps) {
  const editor = selection ? (
    <OperatorDevelopmentEditor
      key={`${selection.operator.charId}:${selection.task ? "planned" : "new"}`}
      hasError={hasError}
      isSubmitting={isSubmitting}
      name={selection.name}
      operator={selection.operator}
      rarity={selection.rarity}
      task={selection.task}
      onSubmit={onSubmit}
      onOpenChange={onOpenChange}
    />
  ) : null;

  return (
    <AdaptiveDialog
      dismissible={!isSubmitting}
      open={selection !== null}
      onOpenChange={onOpenChange}
      testIDPrefix="operator-development"
    >
      {editor}
    </AdaptiveDialog>
  );
}
