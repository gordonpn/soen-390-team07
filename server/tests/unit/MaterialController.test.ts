import 'reflect-metadata';
import { MaterialController } from './../../app/controllers/MaterialController';
import * as sinon from 'sinon';
import { results } from 'inversify-express-utils';
import { Request } from 'express';
import { SinonSandbox } from 'sinon';
import { expect } from 'chai';

const materialService: any = { getMaterialList: Function, createMaterial: Function };
const mockMaterial = {
  description: 'test',
  name: 'green',
  weight: 'lb',
  quantity: 12,
};

let sandbox: SinonSandbox;
let controller: MaterialController;

describe('Material Controller', () => {
  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    controller = new MaterialController(materialService);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Post Request', () => {
    it('Should return a material on successfrom the service layer', async () => {
      const mockRequest = {
        body: mockMaterial,
      } as Request;

      const materialServiceStub = sandbox
        .stub(materialService, 'createMaterial')
        .returns(mockMaterial);

      const res = await controller.post(mockRequest);

      expect(res).to.be.an.instanceof(results.JsonResult);
      expect(materialServiceStub.calledOnceWith(mockMaterial)).to.equal(true);
      expect(res.statusCode).to.equal(200);
      expect(res.json).to.deep.equal({
        description: 'test',
        name: 'green',
        quantity: 12,
        weight: 'lb',
      });
    });

    it('Should return a 400 when the service layer throws an error', async () => {
      const mockRequest = {
        body: mockMaterial,
      } as Request;

      const materialServiceStub = sandbox
        .stub(materialService, 'createMaterial')
        .throws(new Error('Random material failure gang'));

      const res = await controller.post(mockRequest);

      expect(res).to.be.an.instanceof(results.JsonResult);
      expect(materialServiceStub.calledOnceWith(mockMaterial)).to.equal(true);
      expect(res.statusCode).to.equal(400);
      expect(res.json).to.deep.equal('Random material failure gang');
    });
  });

  describe('Get list request', () => {
    it('Should return a list of materials on success from the service layer', async () => {
      const materialServiceStub = sandbox
        .stub(materialService, 'getMaterialList')
        .returns([mockMaterial]);

      const res = await controller.getList();

      expect(res).to.be.an.instanceof(results.JsonResult);
      expect(materialServiceStub.calledOnceWith()).to.equal(true);
      expect(res.statusCode).to.equal(200);
      expect(res.json).to.deep.equal([
        {
          description: 'test',
          name: 'green',
          quantity: 12,
          weight: 'lb',
        },
      ]);
    });
  });

  it('Should return a 400 when the service layer throws an error', async () => {
    const materialServiceStub = sandbox
      .stub(materialService, 'getMaterialList')
      .throws(new Error('Random material failure gang'));

    const res = await controller.getList();

    expect(res).to.be.an.instanceof(results.JsonResult);
    expect(materialServiceStub.calledOnceWith()).to.equal(true);
    expect(res.statusCode).to.equal(400);
    expect(res.json).to.deep.equal('Random material failure gang');
  });
});
