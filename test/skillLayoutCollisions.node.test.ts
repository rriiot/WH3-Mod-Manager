import { describe, expect, it } from "vitest";
import { getSkillLayoutCollisions, NodeToSkill } from "../src/skills";

const node = (
  skill: string,
  indent: string,
  tier: string,
  overrides: Partial<NodeToSkill[string]> = {},
): NodeToSkill[string] => ({
  node: skill.replace("skill", "node"),
  skill,
  tier,
  indent,
  visibleInUI: "1",
  factionKey: "",
  subculture: "",
  requiredNumParents: 0,
  ...overrides,
});

describe("getSkillLayoutCollisions", () => {
  it("finds multiple nodes in the same raw indent and tier position", () => {
    const nodeToSkill: NodeToSkill = {
      node_a: node("skill_a", "2", "3", { node: "node_a" }),
      node_b: node("skill_b", "2", "3", { node: "node_b", factionKey: "wh_main_emp_empire" }),
      node_c: node("skill_c", "2", "4", { node: "node_c" }),
    };

    expect(getSkillLayoutCollisions(["node_a", "node_b", "node_c"], nodeToSkill)).toEqual([
      {
        indent: "2",
        tier: "3",
        nodes: [
          {
            nodeId: "node_a",
            skillKey: "skill_a",
            factionKey: "",
            subculture: "",
            visibleInUI: "1",
            sourcePackName: "Unknown",
          },
          {
            nodeId: "node_b",
            skillKey: "skill_b",
            factionKey: "wh_main_emp_empire",
            subculture: "",
            visibleInUI: "1",
            sourcePackName: "Unknown",
          },
        ],
      },
    ]);
  });

  it("ignores unique positions and nodes missing from nodeToSkill", () => {
    const nodeToSkill: NodeToSkill = {
      node_a: node("skill_a", "0", "1", { node: "node_a" }),
      node_b: node("skill_b", "0", "2", { node: "node_b" }),
    };

    expect(getSkillLayoutCollisions(["node_a", "missing_node", "node_b"], nodeToSkill)).toEqual([]);
  });

  it("keeps source pack metadata for collided nodes", () => {
    const nodeToSkill: NodeToSkill = {
      node_a: node("skill_a", "2", "3", { node: "node_a" }),
      node_b: node("skill_b", "2", "3", { node: "node_b" }),
    };

    expect(
      getSkillLayoutCollisions(["node_a", "node_b"], nodeToSkill, {
        setNodeSources: {
          node_a: { packName: "first.pack", packPath: "C:\\first.pack" },
          node_b: { packName: "second.pack", packPath: "C:\\second.pack" },
        },
      }),
    ).toEqual([
      {
        indent: "2",
        tier: "3",
        nodes: [
          {
            nodeId: "node_a",
            skillKey: "skill_a",
            factionKey: "",
            subculture: "",
            visibleInUI: "1",
            sourcePackName: "first.pack",
            sourcePackPath: "C:\\first.pack",
            setItemSource: { packName: "first.pack", packPath: "C:\\first.pack" },
          },
          {
            nodeId: "node_b",
            skillKey: "skill_b",
            factionKey: "",
            subculture: "",
            visibleInUI: "1",
            sourcePackName: "second.pack",
            sourcePackPath: "C:\\second.pack",
            setItemSource: { packName: "second.pack", packPath: "C:\\second.pack" },
          },
        ],
      },
    ]);
  });
});
