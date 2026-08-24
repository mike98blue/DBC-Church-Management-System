import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { formAnswers, formFields, formSubmissions, formVersions, forms } from '@churchos/db';
import type { Database } from '@churchos/db';
import type { CreateFormDto } from './dto/create-form.dto.js';
import type { SubmitFormDto } from './dto/submit-form.dto.js';

@Injectable()
export class FormsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async create(dto: CreateFormDto): Promise<typeof forms.$inferSelect> {
    const db = this.requireDb();
    const [form] = await db
      .insert(forms)
      .values({
        title: dto.title,
        description: dto.description ?? null,
        visibility: dto.visibility ?? 'public',
      })
      .returning();
    if (!form) throw new Error('Failed to create form');

    const [version] = await db
      .insert(formVersions)
      .values({ formId: form.id, version: 1, status: 'published' })
      .returning();
    if (!version) throw new Error('Failed to create form version');

    if (dto.fields.length) {
      await db.insert(formFields).values(
        dto.fields.map((f, order) => ({
          formVersionId: version.id,
          key: f.key,
          label: f.label,
          type: f.type,
          required: String(Boolean(f.required)),
          options: f.options ?? null,
          order,
        })),
      );
    }

    return form;
  }

  async list(): Promise<(typeof forms.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(forms).orderBy(asc(forms.createdAt));
  }

  async get(
    id: string,
  ): Promise<{ form: typeof forms.$inferSelect; fields: (typeof formFields.$inferSelect)[] }> {
    const db = this.requireDb();
    const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    if (!form) throw new NotFoundException('Form not found');
    const [version] = await db
      .select()
      .from(formVersions)
      .where(eq(formVersions.formId, id))
      .orderBy(asc(formVersions.version))
      .limit(1);
    const fields = version
      ? await db
          .select()
          .from(formFields)
          .where(eq(formFields.formVersionId, version.id))
          .orderBy(asc(formFields.order))
      : [];
    return { form, fields };
  }

  async submit(
    formId: string,
    dto: SubmitFormDto,
    actorId: string | null,
  ): Promise<typeof formSubmissions.$inferSelect> {
    const db = this.requireDb();
    const { form, fields } = await this.get(formId);

    const fieldById = new Map(fields.map((f) => [f.id, f]));
    for (const answer of dto.answers) {
      if (!fieldById.has(answer.fieldId)) {
        throw new BadRequestException(`Unknown field ${answer.fieldId}`);
      }
    }
    for (const field of fields) {
      if (field.required === 'true') {
        const hasAnswer = dto.answers.some(
          (a) => a.fieldId === field.id && (a.value ?? '').trim() !== '',
        );
        if (!hasAnswer) throw new BadRequestException(`Missing required field ${field.key}`);
      }
    }

    const [version] = await db
      .select()
      .from(formVersions)
      .where(eq(formVersions.formId, formId))
      .limit(1);
    if (!version) throw new NotFoundException('Form version not found');

    const [submission] = await db
      .insert(formSubmissions)
      .values({ formId: form.id, formVersionId: version.id, submittedBy: actorId })
      .returning();
    if (!submission) throw new Error('Failed to create submission');

    if (dto.answers.length) {
      await db.insert(formAnswers).values(
        dto.answers.map((a) => ({
          submissionId: submission.id,
          fieldId: a.fieldId,
          value: a.value ?? null,
        })),
      );
    }

    return submission;
  }

  async listSubmissions(formId: string): Promise<(typeof formSubmissions.$inferSelect)[]> {
    const db = this.requireDb();
    await this.get(formId);
    return db
      .select()
      .from(formSubmissions)
      .where(eq(formSubmissions.formId, formId))
      .orderBy(asc(formSubmissions.createdAt));
  }
}
