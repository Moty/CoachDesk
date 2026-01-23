import { Repository } from '../shared/database/base/Repository.js';
import { IDatabaseAdapter } from '../shared/database/interfaces/IDatabaseAdapter.js';
import { SLARule, TicketPriority } from '../models/SLARule.js';
import { AppError, ErrorCode } from '../shared/errors/AppError.js';

interface SLARuleData {
  id: string;
  organizationId: string;
  priority: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: any;
}

export class SLARuleRepository extends Repository<SLARule> {
  constructor(adapter: IDatabaseAdapter) {
    super(adapter, 'sla_rules');
  }

  protected toDomain(data: SLARuleData): SLARule {
    return {
      id: data.id,
      organizationId: data.organizationId,
      priority: data.priority as TicketPriority,
      firstResponseMinutes: data.firstResponseMinutes,
      resolutionMinutes: data.resolutionMinutes,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate(),
    };
  }

  protected toDatabase(entity: Partial<SLARule>): Partial<SLARuleData> {
    const data: Partial<SLARuleData> = {};
    if (entity.organizationId !== undefined) data.organizationId = entity.organizationId;
    if (entity.priority !== undefined) data.priority = entity.priority;
    if (entity.firstResponseMinutes !== undefined) data.firstResponseMinutes = entity.firstResponseMinutes;
    if (entity.resolutionMinutes !== undefined) data.resolutionMinutes = entity.resolutionMinutes;
    if (entity.createdAt !== undefined) data.createdAt = entity.createdAt;
    return data;
  }

  async create(rule: Omit<SLARule, 'id' | 'createdAt'>): Promise<SLARule> {
    if (!Object.values(TicketPriority).includes(rule.priority)) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid priority: ${rule.priority}`,
        400
      );
    }

    if (rule.firstResponseMinutes <= 0 || rule.resolutionMinutes <= 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'SLA times must be positive',
        400
      );
    }

    const existing = await this.findByOrganizationAndPriority(rule.organizationId, rule.priority);
    if (existing) {
      throw new AppError(
        ErrorCode.CONFLICT,
        `SLA rule already exists for priority ${rule.priority}`,
        409
      );
    }

    const newRule: SLARule = {
      ...rule,
      id: '',
      createdAt: new Date(),
    };

    const created = await super.create(newRule);
    return created;
  }

  async findByOrganizationAndPriority(
    organizationId: string,
    priority: TicketPriority
  ): Promise<SLARule | null> {
    return this.findOne({
      where: {
        organizationId,
        priority,
      },
    });
  }

  async update(id: string, updates: Partial<Omit<SLARule, 'id' | 'organizationId' | 'createdAt'>>): Promise<SLARule> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, `SLA rule not found: ${id}`, 404);
    }

    if (updates.priority !== undefined && !Object.values(TicketPriority).includes(updates.priority)) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid priority: ${updates.priority}`,
        400
      );
    }

    if (updates.firstResponseMinutes !== undefined && updates.firstResponseMinutes <= 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'First response time must be positive',
        400
      );
    }

    if (updates.resolutionMinutes !== undefined && updates.resolutionMinutes <= 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Resolution time must be positive',
        400
      );
    }

    if (updates.priority && updates.priority !== existing.priority) {
      const conflict = await this.findByOrganizationAndPriority(existing.organizationId, updates.priority);
      if (conflict) {
        throw new AppError(
          ErrorCode.CONFLICT,
          `SLA rule already exists for priority ${updates.priority}`,
          409
        );
      }
    }

    const updated = await super.update(id, updates);
    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, `SLA rule not found: ${id}`, 404);
    }
    return updated;
  }
}
