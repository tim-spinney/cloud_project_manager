# Entities

## Tasks

### Attributes

- Title
- Description
- Status
- Created at and last modified timestamps

### Relationships

- Can be linked to another task with a directional descriptor (e.g. task 2 is a child of task 1, task 10 is blocked by task 8)
- belongs to a project
- Can be assigned to a user

### User actions

- Create, view, delete a task
- Update title, description, status, assignee for a task
- Link two tasks to each other
- View tasks belonging to a project

## Comments

### Attributes

- Text content
- Created at timestamp

### Relationships

- Belongs to a task
- Authored by a user

### User actions

- View comments belonging to a task
- Post a comment on a task

## Projects

### Attributes

- Name
- Description

### Relationships

- Owned by a user
- Has member users

### User actions

- Create a project
- Invite, remove members
- Change name and/or description
