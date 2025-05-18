import { ItemService } from "@src/items/services";
import { GithubAPI } from "@infrastructure/github";
import { Ok, Err } from "ts-results";
import {
  PROJECT_ID,
  DUE_DATE_FIELD_ID,
} from "@infrastructure/github/constants";

jest.mock("@infrastructure/github", () => ({
  GithubAPI: {
    createIssue: jest.fn(),
    addIssueToProject: jest.fn(),
    updateProjectItemDueDate: jest.fn(),
    updateProjectItemAssignee: jest.fn(),
  },
}));

const mockIssue = {
  id: "issue-123",
  title: "Mock Issue Title",
  url: "https://github.com/mock/issue",
  createdAt: "2025-05-01T00:00:00Z",
  updatedAt: "2025-05-02T00:00:00Z",
};
const mockItem = { id: "item-456" };
const mockSuccessResult = Ok({ success: true });

describe("create", () => {
  const title = "Test Issue";
  const description = "This is a test";
  const dueDate = new Date("2025-05-17T12:00:00Z");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("will return success if all steps succeed", async () => {
    (GithubAPI.createIssue as jest.Mock).mockResolvedValue(Ok(mockIssue));
    (GithubAPI.addIssueToProject as jest.Mock).mockResolvedValue(Ok(mockItem));
    (GithubAPI.updateProjectItemDueDate as jest.Mock).mockResolvedValue(
      mockSuccessResult,
    );

    const result = await ItemService.create({ title, description, dueDate });

    expect(GithubAPI.createIssue).toHaveBeenCalledWith({
      title,
      description,
      dueDate,
    });
    expect(GithubAPI.addIssueToProject).toHaveBeenCalledWith({
      issueId: mockIssue.id,
      projectId: PROJECT_ID,
    });
    expect(GithubAPI.updateProjectItemDueDate).toHaveBeenCalledWith({
      projectId: PROJECT_ID,
      itemId: mockItem.id,
      fieldId: DUE_DATE_FIELD_ID,
      date: dueDate.toISOString(),
    });

    expect(result.ok).toBe(true);
  });

  it("will return error if createIssue fails", async () => {
    const error = new Error("createIssue failed");
    (GithubAPI.createIssue as jest.Mock).mockResolvedValue(Err(error));

    const result = await ItemService.create({ title, description, dueDate });

    expect(result.err).toBe(true);
    expect(result.val).toEqual(error);
    expect(GithubAPI.addIssueToProject).not.toHaveBeenCalled();
    expect(GithubAPI.updateProjectItemDueDate).not.toHaveBeenCalled();
  });

  it("will return error if addIssueToProject fails", async () => {
    const error = new Error("addIssueToProject failed");
    (GithubAPI.createIssue as jest.Mock).mockResolvedValue(Ok(mockIssue));
    (GithubAPI.addIssueToProject as jest.Mock).mockResolvedValue(Err(error));

    const result = await ItemService.create({ title, description, dueDate });

    expect(result.err).toBe(true);
    expect(result.val).toEqual(error);
    expect(GithubAPI.updateProjectItemDueDate).not.toHaveBeenCalled();
  });

  it("will return error if updateProjectItemDueDate fails", async () => {
    const error = new Error("updateProjectItemDueDate failed");
    (GithubAPI.createIssue as jest.Mock).mockResolvedValue(Ok(mockIssue));
    (GithubAPI.addIssueToProject as jest.Mock).mockResolvedValue(Ok(mockItem));
    (GithubAPI.updateProjectItemDueDate as jest.Mock).mockResolvedValue(
      Err(error),
    );

    const result = await ItemService.create({ title, description, dueDate });

    expect(result.err).toBe(true);
    expect(result.val).toEqual(error);
  });
});

describe("updateAssignee", () => {
  const assigneeId = "MDQ6VXNlcjQzMjIzNjgy";
  const itemId = "issue-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("will return success if GitHubAPI.updateProjectItemAssignee succeeds", async () => {
    const mockResult = Ok({ status: "success" });
    (GithubAPI.updateProjectItemAssignee as jest.Mock).mockResolvedValue(mockResult);

    const result = await ItemService.updateAssignee({ assigneeId, itemId });

    expect(GithubAPI.updateProjectItemAssignee).toHaveBeenCalledWith({
      issueId: itemId,
      assigneeId,
    });
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ status: "success" });
  });

  it("will return error if GitHubAPI.updateProjectItemAssignee fails", async () => {
    const error = new Error("updateProjectItemAssignee failed");
    (GithubAPI.updateProjectItemAssignee as jest.Mock).mockResolvedValue(Err(error));

    const result = await ItemService.updateAssignee({ assigneeId, itemId });

    expect(result.err).toBe(true);
    expect(result.val).toEqual(error);
  });
});
