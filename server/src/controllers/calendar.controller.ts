import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class CalendarController {
  /**
   * Generate personalized AI Crop Calendar with automated tasks
   */
  static async createCropCalendar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { cropName, variety, sowingDate, landAreaAcre, fieldLocation } = req.body;

      const sowing = new Date(sowingDate || Date.now());
      let gestationDays = 90;

      if (cropName.toLowerCase().includes('tomato')) gestationDays = 90;
      else if (cropName.toLowerCase().includes('chilli')) gestationDays = 120;
      else if (cropName.toLowerCase().includes('onion')) gestationDays = 110;
      else if (cropName.toLowerCase().includes('paddy') || cropName.toLowerCase().includes('rice')) gestationDays = 140;
      else if (cropName.toLowerCase().includes('banana')) gestationDays = 330;

      const expectedHarvest = new Date(sowing.getTime() + gestationDays * 24 * 60 * 60 * 1000);

      const calendar = await prisma.cropCalendar.create({
        data: {
          farmerId,
          cropName,
          variety: variety || 'Standard High Yield Variety',
          sowingDate: sowing,
          expectedHarvest,
          landAreaAcre: parseFloat(landAreaAcre) || 1.0,
          fieldLocation: fieldLocation || 'Primary Plot',
          status: 'ACTIVE',
        },
      });

      // Generate stage-wise tasks
      const taskTemplates = [
        {
          stageName: 'Basal Soil Preparation (Day 0)',
          taskType: 'FERTILIZER',
          title: 'Basal Application: FYM + Single Super Phosphate',
          titleTamil: 'அடி உரம்: தொழு உரம் & சூப்பர் பாஸ்பேட் இடுதல்',
          description: 'Incorporate 10 tons well-decomposed FYM + 100 kg SSP + 50 kg Neem Cake per acre during final ploughing.',
          daysOffset: 0,
          dosageOrGuidance: '10T FYM + 100kg SSP / Acre',
        },
        {
          stageName: 'Establishment Stage (Day 15)',
          taskType: 'IRRIGATION',
          title: 'First Vegetative Drip Irrigation & Root Drenching',
          titleTamil: 'முதல் வளர்ச்சி பாசனம் & வேர் அழுகல் தடுப்பு',
          description: 'Run drip for 2 hours. Drench root zone with Pseudomonas fluorescens @ 10g/L to prevent seedling damping-off.',
          daysOffset: 15,
          dosageOrGuidance: '10g / L Pseudomonas bio-agent',
        },
        {
          stageName: 'Vegetative Growth (Day 30)',
          taskType: 'FERTILIZER',
          title: 'Top Dressing Fertigation: 19:19:19 NPK',
          titleTamil: 'மேலுரம்: 19:19:19 சமசீர் உரம் சொட்டுநீர் பாசனம்',
          description: 'Inject water-soluble 19:19:19 at 5 kg/acre to stimulate vigorous branching and lush green canopy.',
          daysOffset: 30,
          dosageOrGuidance: '5 kg / Acre via Drip Venturi',
        },
        {
          stageName: 'Flowering & Budding (Day 45)',
          taskType: 'PEST_CONTROL',
          title: 'Flower Induction & Sucking Pest Surveillance',
          titleTamil: 'பூக்கும் பருவம்: பஞ்சகாவ்யா தெளிப்பு & பூச்சி கண்காணிப்பு',
          description: 'Install yellow sticky traps (15/acre). Spray 3% Panchagavya or 0.5% neem oil emulsion for robust flowering.',
          daysOffset: 45,
          dosageOrGuidance: '30ml Panchagavya / L water',
        },
        {
          stageName: 'Fruit/Grain Formation (Day 65)',
          taskType: 'FERTILIZER',
          title: 'Micronutrient Spray: Calcium, Boron & Potassium 0:0:50',
          titleTamil: 'நுண்ணூட்டம்: பொட்டாஷ் மற்றும் கால்சியம் போரான் தெளிப்பு',
          description: 'Foliar spray of Potassium Sulphate (0:0:50 @ 5g/L) + Boron 20% (1g/L) for fruit sizing, weight, and luster.',
          daysOffset: 65,
          dosageOrGuidance: '5g 0:0:50 + 1g Boron / L',
        },
        {
          stageName: 'Maturity & Pre-Harvest (Day 85)',
          taskType: 'HARVESTING',
          title: 'Pre-Harvest Market Listing & Transport Booking',
          titleTamil: 'அறுவடைக்கு முந்தைய சந்தை பதிவு & சரக்கு முன்பதிவு',
          description: 'Pre-list expected harvest on Namma Farm marketplace to lock direct buyers. Clean harvest plastic crates.',
          daysOffset: Math.max(0, gestationDays - 5),
          dosageOrGuidance: 'Grade A sorting preparation',
        },
      ];

      for (const t of taskTemplates) {
        await prisma.calendarTask.create({
          data: {
            calendarId: calendar.id,
            stageName: t.stageName,
            taskType: t.taskType,
            title: t.title,
            titleTamil: t.titleTamil,
            description: t.description,
            dueDate: new Date(sowing.getTime() + t.daysOffset * 24 * 60 * 60 * 1000),
            isCompleted: false,
            dosageOrGuidance: t.dosageOrGuidance,
          },
        });
      }

      const fullCalendar = await prisma.cropCalendar.findUnique({
        where: { id: calendar.id },
        include: { tasks: { orderBy: { dueDate: 'asc' } } },
      });

      sendSuccess(res, fullCalendar, 'AI Crop Calendar created with stage tasks', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get all crop calendars for the farmer
   */
  static async getMyCalendars(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const calendars = await prisma.cropCalendar.findMany({
        where: { farmerId },
        include: { tasks: { orderBy: { dueDate: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, calendars);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const task = await prisma.calendarTask.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        sendError(res, 'Task not found', 404);
        return;
      }

      const updated = await prisma.calendarTask.update({
        where: { id: taskId },
        data: {
          isCompleted: !task.isCompleted,
          completedAt: !task.isCompleted ? new Date() : null,
        },
      });

      sendSuccess(res, updated, 'Task status updated');
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }
}
