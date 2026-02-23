# CODVYN: Integrated Build Stack Guide 2026

**Full-cycle product execution inside one workspace.**
Plan, design, generate, and ship from a single IDE.

*Google Antigravity + Claude Code + Pencil*

This guide is produced by Codvyn for developers who want to compress planning, design, code generation, and delivery into a single uninterrupted IDE workflow. Every stage, from architecture sketching to production commits, runs inside one window.

---

## Contents

1.  [What This Stack Is and Why It Matters](#01-what-this-stack-is-and-why-it-matters)
2.  [Tools Overview](#02-tools-overview)
3.  [Understanding Each Tool](#03-understanding-each-tool)
4.  [Installation and Setup](#04-installation-and-setup)
5.  [Configuration Reference](#05-configuration-reference)
6.  [Workflow Execution Model](#06-workflow-execution-model)
7.  [Prompt Engineering for This Stack](#07-prompt-engineering-for-this-stack)
8.  [Multi-Agent Workflows in Antigravity](#08-multi-agent-workflows-in-antigravity)
9.  [Version Control and Commit Practices](#09-version-control-and-commit-practices)
10. [Stability and Troubleshooting](#10-stability-and-troubleshooting)
11. [Output Standard and Delivery](#11-output-standard-and-delivery)
12. [Reference: Commands and Shortcuts](#12-reference-commands-and-shortcuts)

---

## 01 What This Stack Is and Why It Matters

Modern product development suffers from tool sprawl. Designers work in Figma, architects sketch in separate documents, developers write code in their editor, and deployment happens in a different terminal window. Every context switch is time lost and a potential for misalignment between what was designed and what was built.

The **Codvyn Integrated Build Stack** collapses this spread. By combining **Google Antigravity** as the base IDE, **Claude Code** as the AI code generation engine, and **Pencil** as the in-IDE design canvas, you get a single workspace where every phase of product work happens without leaving the editor.

This is not about replacing deep specialists. It is about giving a solo developer, a small startup team, or any developer who handles multiple roles a way to move from idea to shipped code faster and with less friction than any fragmented toolchain allows.

**Key benefits of this integrated approach:**
*   **No context switching** between design, planning, and coding environments
*   **AI assistance available** at every stage of the pipeline
*   **Design files stored as versioned code artifacts** in the same Git repo
*   **Reduced handoff overhead** between design and engineering
*   **Full pipeline visible and executable** from one IDE window

---

## 02 Tools Overview

Before getting into setup, here is a precise summary of what each tool does inside this stack and how they relate to one another.

| Tool | Role in Stack | Primary Model |
| :--- | :--- | :--- |
| **Google Antigravity** | Base IDE and agent orchestration platform | Gemini 3 Pro / Claude Sonnet 4.5 |
| **Claude Code** | Terminal-native agentic code generation and multi-file editing | Claude Sonnet 4.5 / Opus 4.5 |
| **Pencil** (pencil.dev) | In-IDE vector design canvas with code export | Claude Code via MCP |

These three tools are designed to work together. Antigravity provides the orchestration layer. Claude Code provides the agentic code intelligence. Pencil provides the visual design layer. Each communicates through standard protocols: the VS Code extension API, the Model Context Protocol (MCP), and Claude Code's CLI interface.

---

## 03 Understanding Each Tool

### Google Antigravity
Google Antigravity is an agent-first IDE launched in November 2025, built on a fork of the open-source Visual Studio Code codebase. It was announced alongside Gemini 3 and is designed around the concept of **autonomous agent management** rather than traditional prompt-driven chat assistance.

The IDE provides two primary surfaces. The **Editor view** gives developers a familiar VS Code-style file tree, tab system, and inline AI commands. The **Agent Manager view** functions as a mission control dashboard where you can spawn, monitor, and coordinate multiple AI agents working on different tasks simultaneously, each in its own workspace context.

Antigravity natively supports multiple AI models including Gemini 3 Pro, Claude Sonnet 4.5, Claude Opus 4.5, and GPT-OSS. This gives developers model-level flexibility inside a single environment. Because it is a VS Code fork, most existing VS Code extensions and key bindings transfer directly.

> **Note**: Antigravity uses the Open VSX extension registry rather than the Microsoft-proprietary VS Code Marketplace. Most popular extensions are available on Open VSX, but you may need to install some as VSIX files manually.

### Claude Code
Claude Code is an agentic coding tool built by Anthropic. It lives in the terminal, understands your codebase, and executes multi-file changes through natural language instructions. It was built for developers who want AI that *acts* rather than just suggests.

The official VS Code extension for Claude Code integrates the CLI directly into the IDE. It creates a spark icon in the sidebar, opens a dedicated panel, and renders code changes as inline diffs using the native VS Code diff viewer. You accept or reject changes before they are written to disk. Context awareness is automatic: Claude Code knows which files are open, what code is selected, and what the terminal has recently output.

Claude Code also supports sub-agents for parallel task execution, custom slash commands stored in `.claude/commands/`, MCP server connections for external tool access, named session management with `/rename` and `--resume`, and hooks that trigger on specific tool events.

### Pencil (pencil.dev)
Pencil is a developer-centric vector design platform that runs directly inside your IDE as a VS Code and Cursor extension. It removes the traditional design-to-code handoff by storing design files as versioned `.pen` files inside your Git repository alongside your code.

The design canvas is an infinite WebGL-powered vector surface rendered inside a dedicated IDE panel. You can generate UI components from natural language prompts, import layouts from Figma via copy-paste, draw manually, and convert any design to production-ready HTML, CSS, or React code. Pencil connects to Claude Code through the Model Context Protocol, meaning Claude can read and write Pencil designs programmatically as part of an agent workflow.

Pencil also supports sticky notes on canvas that can be converted into runnable prompts, multiplayer collaboration, and bidirectional Figma integration for teams transitioning from traditional design workflows.

---

## 04 Installation and Setup

Install all three tools in the order listed below. Each step has dependencies on the previous one.

### 01 Install Google Antigravity IDE
Download Antigravity from the official site. It is available for macOS, Windows, and Linux. Run the installer and sign in with your Google account. During public preview, Antigravity is available free with generous usage limits for users on Google AI Pro or Ultra plans.

### 02 Install Node.js
Claude Code requires Node.js version 18 or higher. Verify your version by running `node --version` in the terminal. If Node.js is not installed, download it from [nodejs.org](https://nodejs.org) or use a version manager such as `nvm`. This is a hard requirement; the Claude Code CLI will not function without it.

### 03 Install Claude Code CLI
Open a terminal and run: `npm install -g @anthropic-ai/claude-code`. After installation, run `claude` in any terminal to authenticate with your Anthropic account. You need a Claude Pro, Max, Team, or Enterprise subscription to use Claude Code. Once you run `claude` from within the Antigravity integrated terminal, the VS Code extension will detect and install itself automatically.

### 04 Install Pencil Extension
Open the Extensions panel inside Antigravity (`Ctrl+Shift+X` on Windows/Linux, `Cmd+Shift+X` on Mac). Search for 'Pencil' and install the extension published by pencil.dev. If it does not appear in the Open VSX registry, download the VSIX file from [pencil.dev](https://pencil.dev) and install manually via 'Install from VSIX'. After installation, authenticate Pencil with your Claude Code session to enable AI-powered design generation.

### 05 Create a New Project Workspace
Create a new folder for your project. Open it in Antigravity. Create a `.claude` directory at the root for Claude Code configuration and custom commands. Initialize a Git repository with `git init`. This folder structure is where all design files, code, and agent session data will live.

---

## 05 Configuration Reference

### Antigravity Agent Mode
Antigravity provides several agent modes that change how the AI operates.
*   **Plan Mode**: For structured architecture generation and planning before writing code. This instructs the agent to produce a high-level breakdown and await your approval before executing any file changes.
*   **Agent Mode**: For free-running multi-step execution.
*   **Edit Mode**: For quick single-file edits.

### Claude Code Permissions
By default, Claude Code asks for permission before executing terminal commands, creating files, or making edits. You can configure permission behavior in your project settings. For trusted projects where you want faster iteration, enable auto-accept for low-risk operations. **Always review generated diffs** before accepting changes that touch critical files such as environment configs, authentication logic, or database schemas.

### MCP Server Configuration
The Model Context Protocol allows Claude Code to connect to external tools, databases, and APIs. Configure MCP servers by running `claude` in the terminal and entering `/mcp` to authenticate. The Pencil extension registers itself as an MCP server, which is how Claude Code gains the ability to read and write design canvas files as part of an agent workflow.

### Key Configuration Files

| File or Folder | Purpose |
| :--- | :--- |
| `.claude/settings.json` | Claude Code session permissions, model selection, tool access |
| `.claude/commands/` | Custom slash commands as `.md` files with natural language instructions |
| `.claude/rules/` | Persistent rules that Claude follows across all sessions in this project |
| `*.pen` | Pencil design files stored as versioned JSON in your Git repository |
| `CLAUDE.md` | Project-level context file that Claude Code reads at session start |

**The `CLAUDE.md` file is particularly important.** Place it at the root of your project and use it to document architecture decisions, tech stack choices, naming conventions, and any constraints the AI should respect. Claude Code reads this file automatically at the start of every session.

---

## 06 Workflow Execution Model

The following workflow represents a complete product execution cycle inside this stack. Each phase builds on the previous one and all phases happen inside the same Antigravity workspace.

### 01 Architecture Planning in Antigravity Agent Mode
Before writing any code, use Antigravity's **Agent Manager in Plan mode** to generate the architecture. Describe your product in natural language: the type of application, the target platform, performance requirements, and any constraints. The agent will produce a proposed folder structure, technology stack recommendation, and dependency list. Review and approve this before proceeding. Capture the output in a `CLAUDE.md` file at the project root so all subsequent AI sessions have the context.

### 02 UI Sketching with Pencil
Open a new `.pen` file inside the project folder. The Pencil canvas will open inside an IDE panel. Sketch the main screens of your product: navigation flows, layout blocks, component hierarchy, and state transitions. You can prompt the AI to generate UI layouts from your descriptions, import from Figma if you have existing assets, or draw manually. Use sticky notes on canvas to leave instructions for the code generation step. The `.pen` file is saved to your project and tracked in Git.

### 03 Code Generation with Claude Code
Open the Claude Code panel via the Spark icon in the Antigravity sidebar. Reference your `.pen` design file and `CLAUDE.md` directly in prompts. Ask Claude to implement specific components from the design. Specify the framework, version, and file targets explicitly. Claude will produce inline diffs showing *exactly* what it wants to change. Review each diff, approve what is correct, and reject or redirect what is not. For large features, break the implementation into smaller scoped requests rather than asking for everything at once.

### 04 Iteration and Refactor
Use Claude Code's multi-file editing capability to refactor across components. Reference terminal output directly in prompts using `@terminal:name` to give Claude access to error messages and build logs without copy-pasting. When you need to revert a session to an earlier state, use the context rewind feature by pressing Escape twice to edit a previous message and roll back the code to that point. Commit frequently so you have clean checkpoints to return to.

### 05 Testing and Verification
Ask Claude Code to generate tests for the components it has built, referencing the acceptance criteria documented in `CLAUDE.md`. For frontend work, Antigravity's integrated browser can be used for automated visual verification: the agent navigates the running application and confirms the rendered output matches the design intent. Review generated tests before running them, particularly any that interact with external services or databases.

### 06 Deployment
With the codebase verified and tests passing, use Claude Code to handle deployment scripting. It can write commit messages, create pull requests with descriptions generated from the actual code changes, and produce deployment configuration files. All operations happen inside the Antigravity terminal without switching to a separate tool.

---

## 07 Prompt Engineering for This Stack

The quality of AI output in this stack is directly proportional to the quality of the prompts you write. The following practices will produce consistently better results.

| Practice | Why It Matters |
| :--- | :--- |
| **Reference exact file names** | Say 'edit `src/components/Header.tsx`' rather than 'edit the header component'. Ambiguous references cause Claude to guess. |
| **Specify framework and version** | Always include the framework and version: 'React 18 with TypeScript', 'Next.js 14 App Router'. AI behavior differs significantly between versions. |
| **Limit scope per request** | One clear task per prompt produces better results than bundling multiple changes. Broad prompts lead to over-generation and harder-to-review diffs. |
| **Request explanation only when needed** | Do not ask Claude to explain every step unless you need the explanation. Explanation adds tokens and slows execution. Ask only when debugging. |
| **Include constraints explicitly** | State what you do *not* want as well as what you do. 'Do not modify the existing auth logic' prevents unintended changes. |
| **Use `CLAUDE.md` for persistent context** | Put architecture decisions, naming conventions, and stack choices in `CLAUDE.md` so you do not have to repeat them in every prompt. |
| **Validate before execution** | For any prompt that touches environment config, database, or auth, review the diff carefully before accepting. These areas deserve extra scrutiny. |

### Example: A well-structured prompt
> In `src/components/ProductCard.tsx`, add a loading skeleton state using the existing Skeleton component from `src/ui/Skeleton.tsx`.
> Use React 18 with TypeScript. Do not change the existing prop types or styling.
> The skeleton should show three lines matching the layout of the card title, price, and image.

---

## 08 Multi-Agent Workflows in Antigravity

One of Antigravity's primary differentiators is the Agent Manager, which allows you to run multiple autonomous agents simultaneously on different parts of a codebase. Understanding how to use this effectively is important for larger projects.

### How Multi-Agent Execution Works
Each agent in Antigravity operates in its own workspace context. Agents can plan, edit files, run terminal commands, and verify results in parallel. A developer acts as the architect: defining high-level objectives, dispatching agents to implement them, and reviewing the outputs. The Agent Manager dashboard shows the progress, status, and output of each active agent.

### Using Claude Code Alongside Antigravity Agents
Claude Code and Antigravity agents are complementary rather than competing. Antigravity's native agents run on Gemini 3 Pro by default and are optimized for large-context, autonomous multi-step orchestration. Claude Code runs in the terminal and is optimized for precise, targeted code edits with explicit diff review. A practical split is to use Antigravity agents for broad exploratory tasks and Claude Code for targeted component-level implementation.

**Recommended agent split for a typical feature build:**
*   **Antigravity Agent 1**: Architecture planning and folder structure generation
*   **Antigravity Agent 2**: Automated test generation in parallel with implementation
*   **Claude Code in terminal**: Targeted component implementation with diff review
*   **Pencil canvas**: UI design and component specification living alongside the code

### Conflict Resolution
When multiple agents modify overlapping files, Antigravity provides a visual conflict resolution interface with merge guidance and rollback controls. Avoid pointing multiple agents at the same file simultaneously unless the conflict resolution workflow is part of your intended process. For most workflows, assign each agent a clearly bounded area of the codebase.

---

## 09 Version Control and Commit Practices

Frequent, meaningful commits are the primary safety net when working with AI-generated code. The following practices protect you from difficult-to-reverse changes and make the history of your project readable.

| Practice | Rationale |
| :--- | :--- |
| **Commit after each approved diff** | Each accepted Claude Code change should correspond to a commit. Batching many AI changes into one commit makes rollback harder. |
| **Use branches for feature work** | Each feature should be on its own branch. This lets you use agents to build features in isolation and merge them cleanly. |
| **Write descriptive commit messages** | Ask Claude Code to write commit messages: 'Write a commit message for these changes.' It will generate messages based on the actual diff content. |
| **Store `.pen` files in Git** | Pencil design files are JSON-based and version-controlled. Treat them the same as code. This lets you roll back design and code together. |
| **Review diffs before merging to main** | Never merge AI-generated branches to main without manual diff review. Claude Code produces correct code most of the time but not always. |

---

## 10 Stability and Troubleshooting

Running three integrated tools in one environment introduces some potential friction points. The following are the most common issues and how to resolve them.

| Issue | Resolution |
| :--- | :--- |
| **Claude Code extension not appearing after install** | Run the `claude` command from within the Antigravity integrated terminal. The extension auto-installs when it detects the CLI running inside the IDE. If it still does not appear, run `Developer: Reload Window` from the command palette. |
| **Shift+Enter not working for multi-line prompts** | Run `/terminal-setup` inside a Claude Code session. This configures the terminal keybinding automatically. |
| **Pencil canvas not connecting to Claude Code** | Ensure the Pencil extension is authenticated with Claude Code via the MCP server. Open the Pencil sidebar and follow the authentication flow. Claude Code must be running in the same session. |
| **Agent Manager not showing agent progress** | Switch between the Editor and Manager views using the view controls in the top navigation bar. Check that you have an active workspace folder open. |
| **Extensions not available in Open VSX** | Download the extension VSIX directly from the developer's site or the VS Code marketplace, then install via `Extensions: Install from VSIX` in the command palette. |
| **High memory usage with multiple agents** | Antigravity uses more RAM than standard VS Code, particularly when running multiple agents with large file contexts. Close agents you are not actively monitoring and restart the IDE if performance degrades significantly. |
| **IDE slow after long sessions** | Long conversation histories in Claude Code can increase memory usage. Use `/resume` to continue a named session or start a fresh session and reference the project context from `CLAUDE.md`. |

---

## 11 Output Standard and Delivery

The purpose of this stack is to compress the roles of architect, designer, and developer into a single executable workflow. When operating correctly, the pipeline produces the following outputs from a single IDE window.

| Output | Description |
| :--- | :--- |
| `CLAUDE.md` | Architecture document capturing stack decisions, constraints, and conventions |
| `*.pen` files | Versioned design files tracking the UI evolution of the product |
| `src/` | Production-ready component code generated and reviewed in Claude Code |
| `tests/` | Test files generated by Claude Code alongside the implementation |
| **Commit history** | A readable Git history where each commit maps to a design or code decision |
| **Pull requests** | Documented PRs with descriptions written by Claude Code from actual diff context |

The measure of a successful workflow in this stack is not just whether the code works. It is whether the complete record of decisions, from initial architecture through final design and implementation, is legible to any developer who opens the repository later.

---

## 12 Reference: Commands and Shortcuts

### Claude Code Slash Commands
| Command | Description |
| :--- | :--- |
| `/ide` | Connect Claude Code CLI to the current IDE instance |
| `/mcp` | Open MCP server authentication and management |
| `/terminal-setup` | Configure terminal keybindings for multi-line prompt input |
| `/rename` | Name the current session for later resumption |
| `/resume` | Resume a named session from the CLI |
| `/model` | Switch the active model within a session |
| `/stats` | View usage statistics including model history and usage streaks |
| `/hooks` | Configure event-based hooks for tool execution |

### Useful Antigravity Key Bindings
| Shortcut | Action |
| :--- | :--- |
| `Ctrl+Shift+X` / `Cmd+Shift+X` | Open Extensions panel |
| `Ctrl+Shift+P` / `Cmd+Shift+P` | Open Command Palette |
| `Ctrl+`` / `Cmd+`` | Open integrated terminal |
| `Ctrl+N` / `Cmd+N` | Start new Claude Code conversation |

### Claude Code CLI Flags
| Flag or Reference | Description |
| :--- | :--- |
| `claude --resume` | Resume a specific named session from the terminal |
| `claude --continue` | Continue the most recent session |
| `claude --agent` | Override the agent for the current session |
| `@terminal:name` | Reference terminal output by terminal name inside a prompt |

---

*codvyn.in | instagram.com/codvyn*
