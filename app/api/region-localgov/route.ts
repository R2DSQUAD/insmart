import { NextResponse } from 'next/server';
import { initializeDataSource } from '@/lib/data-source';
import { Region } from '@/lib/entity/Region';
import { LocalGovernment } from '@/lib/entity/LocalGovernment';

export async function GET() {
  const dataSource = await initializeDataSource();
  const regionRepo = dataSource.getRepository(Region);
  const localGovRepo = dataSource.getRepository(LocalGovernment);

  // 모든 행정구역
  const regions = await regionRepo.find();
  // 모든 자치단체
  const localGovernments = await localGovRepo.find();

  return NextResponse.json({
    regions,
    localGovernments
  });
}
