import { describe, expect, it, jest } from '@jest/globals';
import { CrearGrupoUseCaseImpl } from '../../src/application/usecases/CrearGrupoUseCaseImpl';
import { GrupoRepository } from '../../src/domain/ports/out/GrupoRepository';
import { UsuarioRepository } from '../../src/domain/ports/out/UsuarioRepository';
import { MovimientoRepository } from '../../src/domain/ports/out/MovimientoRepository';
import { Usuario } from '../../src/domain/entities/Usuario';
import { Grupo } from '../../src/domain/entities/Grupo';
import { ValidacionError } from '../../src/domain/errors/DomainErrors';

describe('CrearGrupoUseCaseImpl', () => {
  const creador = Usuario.reconstruir({
    id: 1,
    nombre: 'Juan Perez',
    email: 'juan@example.com',
    passwordHash: 'hash',
    fechaRegistro: new Date(),
    estado: 'activo',
  });

  const mockGrupoRepo: jest.Mocked<GrupoRepository> = {
    crear: jest.fn<any>().mockResolvedValue(
      new Grupo({
        id: 10,
        nombre: 'Viaje Cartagena',
        creadoPor: 1,
      }),
    ),
    buscarPorId: jest.fn<any>(),
    obtenerDetalle: jest.fn<any>().mockResolvedValue({
      id: 10,
      nombre: 'Viaje Cartagena',
      descripcion: null,
      icono: 'plane',
      ciudad: null,
      lat: null,
      lng: null,
      creadoPor: 1,
      fechaCreacion: new Date(),
      estado: 'activo',
      miembros: [],
    }),
    listarPorUsuario: jest.fn<any>(),
    esMiembro: jest.fn<any>(),
    obtenerRol: jest.fn<any>(),
    agregarMiembro: jest.fn<any>(),
    cambiarEstadoMiembro: jest.fn<any>(),
    archivarGrupo: jest.fn<any>(),
  };

  const mockUsuarioRepo: jest.Mocked<UsuarioRepository> = {
    guardar: jest.fn<any>(),
    buscarPorEmail: jest.fn<any>().mockResolvedValue(null),
    buscarPorId: jest.fn<any>().mockResolvedValue(creador),
    existeEmail: jest.fn<any>(),
  };

  const mockMovimientoRepo: jest.Mocked<MovimientoRepository> = {
    registrar: jest.fn<any>().mockResolvedValue({} as any),
    listarPorUsuario: jest.fn<any>(),
    listarPorGrupo: jest.fn<any>(),
  };

  it('crea un grupo exitosamente y registra movimiento', async () => {
    const useCase = new CrearGrupoUseCaseImpl(mockGrupoRepo, mockUsuarioRepo, mockMovimientoRepo);

    const resultado = await useCase.ejecutar(1, {
      nombre: 'Viaje Cartagena',
      descripcion: 'Vacaciones',
      icono: 'plane',
    });

    expect(resultado.id).toBe(10);
    expect(mockGrupoRepo.crear).toHaveBeenCalled();
    expect(mockMovimientoRepo.registrar).toHaveBeenCalled();
  });

  it('lanza error si el nombre del grupo está vacío', async () => {
    const useCase = new CrearGrupoUseCaseImpl(mockGrupoRepo, mockUsuarioRepo, mockMovimientoRepo);

    await expect(
      useCase.ejecutar(1, {
        nombre: '   ',
      }),
    ).rejects.toThrow(ValidacionError);
  });
});
