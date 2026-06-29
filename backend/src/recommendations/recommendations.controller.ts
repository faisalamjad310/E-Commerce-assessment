import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

interface OptionalJwtRequest {
  user?: { userId: string; email: string; role: string } | null;
}

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get product recommendations. Personalised for logged-in users, newest for guests.',
  })
  getRecommendations(
    @Request() req: OptionalJwtRequest,
    @Query('excludeProductId') excludeProductId?: string,
  ) {
    return this.recommendationsService.getRecommendations(
      req.user?.userId,
      excludeProductId,
    );
  }
}
