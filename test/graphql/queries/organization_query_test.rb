require 'test_helper'

class Queries::OrganizationQueryTest < ActiveSupport::TestCase
  test 'fetching organization attributes' do
    environment = FactoryBot.create(:environment)
    FactoryBot.create(:puppetclass, :environments => [environment])
    organization = FactoryBot.create(:organization, environments: [environment])

    query = <<-GRAPHQL
      query (
        $id: String!
      ) {
        organization(id: $id) {
          id
          createdAt
          updatedAt
          name
          title
          environments {
            totalCount
            edges {
              node {
                id
              }
            }
          }
          puppetclasses {
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      }
    GRAPHQL

    organization_global_id = Foreman::GlobalId.for(organization)
    variables = { id: organization_global_id }
    context = { current_user: FactoryBot.create(:user, :admin) }

    result = ForemanGraphqlSchema.execute(query, variables: variables, context: context)
    expected = {
      'organization' => {
        'id' => organization_global_id,
        'createdAt' => organization.created_at.utc.iso8601,
        'updatedAt' => organization.updated_at.utc.iso8601,
        'name' => organization.name,
        'title' => organization.title,
        'environments' => {
          'totalCount' => organization.environments.count,
          'edges' => organization.environments.sort_by(&:id).map do |env|
            {
              'node' => {
                'id' => Foreman::GlobalId.for(env)
              }
            }
          end
        },
        'puppetclasses' => {
          'totalCount' => organization.puppetclasses.count,
          'edges' => organization.puppetclasses.map do |puppetclass|
            {
              'node' => {
                'id' => Foreman::GlobalId.for(puppetclass)
              }
            }
          end
        }
      }
    }

    assert_empty result['errors']
    assert_equal expected, result['data']
  end
end
