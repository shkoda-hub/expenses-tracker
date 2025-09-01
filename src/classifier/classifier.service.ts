import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  pipeline,
  ZeroShotClassificationOutput,
  ZeroShotClassificationPipeline,
} from '@huggingface/transformers';
import { Category } from '../shared/enums/categories.enum';

@Injectable()
export class ClassifierService implements OnModuleInit {
  private readonly categories: string[] = Object.values(Category);
  private readonly logger = new Logger(ClassifierService.name);

  private classifier: ZeroShotClassificationPipeline;

  /***
   classify expense via Xenova/nli-deberta-v3-small model
   **/
  async classify(description: string) {
    const result:
      | ZeroShotClassificationOutput
      | ZeroShotClassificationOutput[] = await this.classifier(
      description,
      this.categories,
    );

    return Array.isArray(result) ? result[0].labels[0] : result.labels[0];
  }

  async onModuleInit() {
    try {
      this.classifier = await pipeline<'zero-shot-classification'>(
        'zero-shot-classification',
        'Xenova/nli-deberta-v3-small',
        {
          device: 'cpu',
          dtype: 'auto',
        },
      );

      await this.wakeUpModel();
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async wakeUpModel() {
    await this.classifier('milk and apples', this.categories);
    await this.classifier('tickets and popcorn', this.categories);
  }
}
