// Controlador de Materiales y Recursos Académicos
// Gestiona el acceso a documentos y guías de estudio alojadas en Amazon S3

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// GET /api/materials — Listar materiales (opcionalmente filtrados por ?courseId=...)
export const getMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, uploadedById } = req.query;

    const materials = await prisma.material.findMany({
      where: {
        ...(courseId ? { courseId: String(courseId) } : {}),
        ...(uploadedById ? { uploadedById: String(uploadedById) } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true } },
        uploadedBy: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(200).json(materials);
  } catch (error) {
    next(error);
  }
};

// GET /api/materials/:id — Obtener un material por ID
export const getMaterialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        uploadedBy: { select: { id: true, name: true, role: true } },
      },
    });

    if (!material) {
      res.status(404).json({ success: false, message: 'Material de estudio no encontrado.' });
      return;
    }

    res.status(200).json(material);
  } catch (error) {
    next(error);
  }
};

// POST /api/materials — Registrar un nuevo material (enlace S3 o externo)
export const createMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, uploadedById, title, description, fileUrl, fileType } = req.body;

    const newMaterial = await prisma.material.create({
      data: {
        courseId,
        uploadedById,
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        fileUrl: String(fileUrl).trim(),
        fileType: fileType ? String(fileType).trim() : 'pdf',
      },
      include: {
        course: { select: { id: true, title: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Material registrado con éxito.',
      data: newMaterial,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/materials/:id — Actualizar información de un material
export const updateMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, description, fileUrl, fileType } = req.body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = String(title).trim();
    if (description !== undefined) dataToUpdate.description = description ? String(description).trim() : null;
    if (fileUrl !== undefined) dataToUpdate.fileUrl = String(fileUrl).trim();
    if (fileType !== undefined) dataToUpdate.fileType = String(fileType).trim();

    const updated = await prisma.material.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({
      success: true,
      message: 'Material actualizado con éxito.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/materials/:id — Eliminar un material
export const deleteMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.material.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Material eliminado con éxito.',
    });
  } catch (error) {
    next(error);
  }
};
