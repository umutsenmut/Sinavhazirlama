"""İlk tablo migrasyonu - tüm tablolar oluşturuluyor

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # workspaces tablosu
    op.create_table(
        "workspaces",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workspaces_id", "workspaces", ["id"])
    op.create_index("ix_workspaces_slug", "workspaces", ["slug"], unique=True)

    # users tablosu
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("school_name", sa.String(255), nullable=True),
        sa.Column("workspace_id", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # workspaces owner_id FK ekle
    op.create_foreign_key(
        "fk_workspaces_owner_id",
        "workspaces", "users",
        ["owner_id"], ["id"],
        ondelete="SET NULL",
    )

    # plans tablosu
    op.create_table(
        "plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("file_path", sa.String(1000), nullable=True),
        sa.Column("parsing_status", sa.String(20), nullable=False, default="pending"),
        sa.Column("parsed_content", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_plans_id", "plans", ["id"])
    op.create_index("ix_plans_workspace_id", "plans", ["workspace_id"])

    # exams tablosu
    op.create_table(
        "exams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("grade", sa.String(10), nullable=False),
        sa.Column("subject", sa.String(100), nullable=False),
        sa.Column("week_number", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_exams_id", "exams", ["id"])
    op.create_index("ix_exams_workspace_id", "exams", ["workspace_id"])

    # questions tablosu
    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("exam_id", sa.Integer(), nullable=False),
        sa.Column("question_type", sa.String(20), nullable=False, default="test"),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("options", sa.Text(), nullable=True),
        sa.Column("correct_answer", sa.Text(), nullable=True),
        sa.Column("points", sa.Integer(), nullable=False, default=5),
        sa.Column("order_num", sa.Integer(), nullable=False, default=0),
        sa.ForeignKeyConstraint(["exam_id"], ["exams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_questions_id", "questions", ["id"])
    op.create_index("ix_questions_exam_id", "questions", ["exam_id"])


def downgrade() -> None:
    op.drop_table("questions")
    op.drop_table("exams")
    op.drop_table("plans")
    op.drop_constraint("fk_workspaces_owner_id", "workspaces", type_="foreignkey")
    op.drop_table("users")
    op.drop_table("workspaces")
