import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  findAll() {
    return this.categoryModel.find().sort({ name: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).lean().exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryModel.findOne({ name: dto.name }).exec();
    if (existing) throw new ConflictException(`Category "${dto.name}" already exists`);
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.categoryModel.create({ ...dto, slug });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    if (dto.name) {
      const conflict = await this.categoryModel
        .findOne({ name: dto.name, _id: { $ne: id } })
        .exec();
      if (conflict) throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    const category = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return { deleted: true };
  }
}
