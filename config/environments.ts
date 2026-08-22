export type TestEnvironmentName = 'demo' | 'dev' | 'qa' | 'uat';

export type TestEnvironment = {
  name: TestEnvironmentName;
  baseURL: string;
  tags: string[];
};

const environments: Record<TestEnvironmentName, TestEnvironment> = {
  demo: {
    name: 'demo',
    baseURL: 'https://demo.playwright.dev',
    tags: ['@demo_env'],
  },
  dev: {
    name: 'dev',
    baseURL: 'https://demo.playwright.dev',
    tags: ['@dev_env'],
  },
  qa: {
    name: 'qa',
    baseURL: 'https://demo.playwright.dev',
    tags: ['@qa_env'],
  },
  uat: {
    name: 'uat',
    baseURL: 'https://demo.playwright.dev',
    tags: ['@uat_env'],
  },
};

export function getTestEnvironment(envName = process.env.TEST_ENV): TestEnvironment {
  const normalizedName = (envName ?? 'demo').toLowerCase() as TestEnvironmentName;
  const environment = environments[normalizedName];

  if (!environment) {
    throw new Error(
      `Unsupported TEST_ENV "${envName}". Supported values: ${Object.keys(environments).join(', ')}`,
    );
  }

  return {
    ...environment,
    baseURL: process.env.BASE_URL ?? environment.baseURL,
  };
}
