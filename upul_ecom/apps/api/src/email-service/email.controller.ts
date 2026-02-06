import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getEmailQueueStats, getFailedEmails, retryFailedEmail } from './email-queue';

const prisma = new PrismaClient();

// Get email queue statistics
export const getEmailQueueStatus = async (req: Request, res: Response) => {
  try {
    const stats = await getEmailQueueStats();
    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching email queue stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch email queue statistics',
    });
  }
};

// Get failed emails
export const getFailedEmailsList = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [failedEmails, total] = await Promise.all([
      getFailedEmails(skip, limit),
      prisma.emailLog.count({ where: { status: 'permanently_failed' } }),
    ]);

    return res.json({
      success: true,
      data: {
        emails: failedEmails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching failed emails:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch failed emails',
    });
  }
};

// Get email log history for an order
export const getOrderEmailHistory = async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const emailLogs = await prisma.emailLog.findMany({
      where: {
        orderNumber,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: emailLogs,
    });
  } catch (error) {
    console.error('Error fetching email history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch email history',
    });
  }
};

// Manually retry a failed email
export const retryFailedEmailManually = async (req: Request, res: Response) => {
  try {
    const { emailLogId } = req.params;

    // Get the email log to find original email data
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    });

    if (!emailLog) {
      return res.status(404).json({
        success: false,
        error: 'Email log not found',
      });
    }

    // Retry the email
    await retryFailedEmail(emailLogId);

    return res.json({
      success: true,
      message: `Email retry queued for ${emailLog.recipientEmail}`,
    });
  } catch (error) {
    console.error('Error retrying failed email:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retry email',
    });
  }
};

// Get email statistics
export const getEmailStatistics = async (req: Request, res: Response) => {
  try {
    const [totalSent, totalFailed, today, thisMonth, byType] = await Promise.all([
      prisma.emailLog.count({ where: { status: 'sent' } }),
      prisma.emailLog.count({ where: { status: 'permanently_failed' } }),
      prisma.emailLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.emailLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.emailLog.groupBy({
        by: ['emailType'],
        _count: {
          id: true,
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalSent,
        totalFailed,
        sentToday: today,
        sentThisMonth: thisMonth,
        byType,
      },
    });
  } catch (error) {
    console.error('Error fetching email statistics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch email statistics',
    });
  }
};

// Cleanup old email logs (optional - for maintenance)
export const cleanupOldEmailLogs = async (req: Request, res: Response) => {
  try {
    const daysToKeep = parseInt(req.query.days as string) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.emailLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return res.json({
      success: true,
      message: `Deleted ${result.count} email logs older than ${daysToKeep} days`,
    });
  } catch (error) {
    console.error('Error cleaning up email logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cleanup email logs',
    });
  }
};